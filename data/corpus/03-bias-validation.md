---
id: bias-validation
title_en: Validate bias and representation
title_th: ตรวจสอบอคติและความครอบคลุมของข้อมูล
source_title: Guidance for generative AI in education and research
source_url: https://unesdoc.unesco.org/ark:/48223/pf0000386693
source_locator: Chapter 4, validation recommendations
source_page: 24
license: CC BY-SA 3.0 IGO
chunk_id: bias-validation-01
---

## English source extract

UNESCO recommends validation mechanisms that examine whether systems used in education contain biases, including gender bias, and whether their training data represent diversity across disability, social and economic status, culture, and geography.

Validation asks a concrete question: who receives a worse result, and why? A system may fail because its training material ignores a language, its interface excludes a learner with a disability, or its recommendations assume one cultural context. A polished answer does not prove fair treatment. Teams need test questions that deliberately vary names, languages, access needs, and situations.

The RAG assistant has a smaller validation task. Learners inspect whether a retrieved chunk actually supports the claim. They can compare a keyword result with a semantic result and notice when a high similarity score still retrieves a weak source. Similarity ranks candidates; it does not prove truth, completeness, or fairness.

## คำแปลภาษาไทย

UNESCO แนะนำให้มีกลไกตรวจสอบว่าระบบที่ใช้ในการศึกษามีอคติหรือไม่ รวมถึงอคติทางเพศ และตรวจดูว่าข้อมูลฝึกครอบคลุมความหลากหลายด้านความพิการ สถานะทางสังคมและเศรษฐกิจ วัฒนธรรม และภูมิศาสตร์หรือไม่

การตรวจสอบตั้งคำถามอย่างเป็นรูปธรรมว่า ใครได้รับผลลัพธ์ที่แย่กว่าและเพราะอะไร ระบบอาจล้มเหลวเพราะข้อมูลฝึกไม่ครอบคลุมภาษา หน้าจอเข้าถึงยากสำหรับผู้มีความพิการ หรือคำแนะนำตั้งอยู่บนบริบทวัฒนธรรมเดียว คำตอบที่ดูสวยงามไม่ได้พิสูจน์ว่าปฏิบัติอย่างเป็นธรรม

ในผู้ช่วย RAG ผู้เรียนตรวจว่าข้อความที่ค้นคืนสนับสนุนข้ออ้างจริงหรือไม่ เปรียบเทียบผลจาก keyword และ semantic ได้ คะแนน similarity จัดอันดับผู้สมัคร แต่ไม่ได้พิสูจน์ความจริง ความครบถ้วน หรือความเป็นธรรม
