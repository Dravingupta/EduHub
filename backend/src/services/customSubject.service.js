/**
 * Custom Subject Service
 *
 * Handles creation of custom user-defined subjects by leveraging
 * Gemini to break down raw syllabus text into structured sections and topics.
 *
 * It stores the resulting Custom Subject and its Topics in the database.
 */

import * as subjectRepository from '../repositories/subject.repository.js';
import * as topicRepository from '../repositories/topic.repository.js';
import geminiService from './llm/gemini.service.js';

/**
 * Creates a custom subject from a raw syllabus string.
 *
 * Flow:
 * 1. Validate syllabus input.
 * 2. Prompt Gemini to extract sections and topics as structured JSON.
 * 3. Validate the JSON structure returned by the LLM.
 * 4. Create the Subject document.
 * 5. Create all the returned Topics inside the database.
 * 6. Return the summary.
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.courseName
 * @param {string} params.year
 * @param {string} params.subjectName
 * @param {string} params.syllabusText
 * @returns {Promise<object>} Summary of the created subject
 */
export const createCustomSubject = async ({
    userId,
    courseName,
    year,
    subjectName,
    syllabusText,
    targetDays
}) => {
    // Basic validation
    if (!syllabusText || syllabusText.length < 50) {
        throw new Error('[CustomSubjectService] Syllabus text is too short. Please provide at least 50 characters.');
    }
    if (!userId || !subjectName) {
        throw new Error('[CustomSubjectService] userId and subjectName are required.');
    }

    console.log(`[CustomSubjectService] Starting custom subject creation for User: ${userId}, Subject: ${subjectName}`);

    // Step 1: Call Gemini to extract topics
    const prompt = `
From the following syllabus text:

${syllabusText}

Extract structured topics grouped into sections if possible.

Return strict JSON format:
{
  "sections": [
    {
      "section_name": "",
      "topics": ["", "", ""]
    }
  ]
}

No explanations.
JSON only.`;

    let extractedData;
    try {
        console.log('[CustomSubjectService] Calling Gemini for syllabus extraction...');
        // gemini.service.js handles the safety parsing and throws if invalid JSON
        extractedData = await geminiService.generateLesson(prompt);
        // Note: Reusing the generateLesson method here because it simply pipes the prompt 
        // through the same 'always return valid JSON' system instruction.
    } catch (error) {
        throw new Error(`[CustomSubjectService] LLM Extraction Failed: ${error.message}`);
    }

    // Step 2: Validate JSON Structure
    if (!extractedData || !Array.isArray(extractedData.sections) || extractedData.sections.length === 0) {
        throw new Error('[CustomSubjectService] LLM returned invalid structure: Missing or empty "sections" array.');
    }

    let totalTopicsCount = 0;
    extractedData.sections.forEach(section => {
        if (!section.section_name || !Array.isArray(section.topics) || section.topics.length === 0) {
            throw new Error('[CustomSubjectService] LLM returned invalid structure: A section is missing a name or has no topics.');
        }
        totalTopicsCount += section.topics.length;
    });

    if (totalTopicsCount === 0) {
        throw new Error('[CustomSubjectService] No valid topics could be extracted from the syllabus.');
    }

    // Step 3: Create Subject Entry
    console.log('[CustomSubjectService] JSON validated. Creating subject in DB...');
    const subjectData = {
        user_id: userId,
        subject_name: subjectName,
        type: 'custom',
        topic_mastery_map: {},
        explanation_density_preference: 50,
        difficulty_preference: 'medium',
        target_days: targetDays || 120
    };

    const newSubject = await subjectRepository.createSubject(subjectData);

    // Step 4: Create Topics in DB
    console.log(`[CustomSubjectService] Creating ${totalTopicsCount} topics in DB...`);
    const topicsToInsert = [];
    let globalOrderIndex = 1;

    extractedData.sections.forEach((section) => {
        section.topics.forEach((topicName) => {
            topicsToInsert.push({
                subject_id: newSubject._id,
                topic_name: topicName,
                section_name: section.section_name,
                order_index: globalOrderIndex++
            });
        });
    });

    await topicRepository.bulkCreateTopics(topicsToInsert);

    // Step 5: Return Subject Summary
    console.log('[CustomSubjectService] Custom Subject creation completed successfully.');
    return {
        subject_id: newSubject._id.toString(),
        total_sections: extractedData.sections.length,
        total_topics: totalTopicsCount
    };
};
