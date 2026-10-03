# Requirements Document

## Introduction

[APP NAME] is an offline-first study coach for one Grade 7 public school student in the Philippines who reads below grade level. The student uses a low-end or shared Android phone on prepaid data. The barrier: the student cannot understand the lesson file (PDF, sometimes PPTX) that the teacher sent to the class group chat.

One person (the Pack_Maker, often a classmate or the student) turns the lesson file into a small Study_Pack once. AI runs only at this step. The Pack_Maker previews the pack, removes bad questions, and shares the pack file. After the pack is saved on the phone, everything works in airplane mode: a short lesson summary at the right reading level, a study path, coaching hints that point back to the lesson text, read-aloud, glossary flashcards in English and Filipino, and per-skill mastery bars.

No accounts, no names, no teacher setup. Progress stays on the phone. Two people build this in 12 hours, so scope is kept small.

The app name lives in one code constant (APP_NAME, value "[APP NAME]") and the pack file extension lives in one code constant (PACK_EXTENSION, value ".studypack"). The Pack_Service text limit lives in MAX_LESSON_CHARS and the Pack_Service wait time lives in PACK_TIMEOUT_SECONDS.

## Glossary

- **App**: The [APP NAME] progressive web app running in the phone's browser.
- **APP_NAME**: The single code constant that holds the app name. Value for now: "[APP NAME]".
- **PACK_EXTENSION**: The single code constant that holds the pack file extension. Value for now: ".studypack".
- **MAX_LESSON_CHARS**: The single code constant that holds the longest Lesson_Text the Pack_Service accepts, in characters. Default value: 30000.
- **PACK_TIMEOUT_SECONDS**: The single code constant that holds how long the App waits for the Pack_Service. Default value: 60.
- **Device_Check**: The part of the App that reads device memory and data-saver settings on first run and proposes a mode.
- **Lite_Mode**: A mode with no animations and a 5 MB import limit, for phones with 4 GB memory or less, or data-saver users.
- **Standard_Mode**: The normal mode, with animations and a 20 MB import limit.
- **Lesson_File**: A PDF (required) or PPTX (optional) file from the teacher.
- **Lesson_Text**: The plain text the Importer pulls out of a Lesson_File, split into numbered Source_Paragraphs.
- **Source_Paragraph**: One numbered paragraph of Lesson_Text. Hints, Explanations, and Lesson_Summaries link to Source_Paragraphs.
- **Page_Range**: A first and last page (or slide) of a Lesson_File that the Pack_Maker picks when the Lesson_Text is too long.
- **Importer**: The part of the App that reads a Lesson_File and produces Lesson_Text, on the phone.
- **Fingerprint**: A hash of the final Lesson_Text (after any Page_Range is applied), computed on the phone, used to spot a lesson that already has a pack on this phone.
- **Pack_Service**: The one server endpoint that turns Lesson_Text into a Study_Pack using a small AI model. Returns JSON only and keeps nothing.
- **Study_Pack**: The JSON data for one lesson: Source_Paragraphs, Lesson_Summaries, Skills, Questions at Reading_Levels 1-3, Hints, Explanations, and Glossary_Cards.
- **Lesson_Summary**: A short summary of the lesson written at one Reading_Level. A Study_Pack has one Lesson_Summary for each of Reading_Levels 1, 2, and 3, each linked to one or more Source_Paragraph numbers.
- **Pack_Format_Check**: The check that a Study_Pack has the right structure: every required field present with the right type, every Source_Paragraph link pointing to an existing Source_Paragraph, and at least 1 Question.
- **Full_Coverage_Check**: The check that a Study_Pack has at least one Question for every Skill at every Reading_Level (4 Skills x 3 Reading_Levels = at least 12 Questions).
- **Coverage_Slot**: One Skill at one Reading_Level (for example, "inference at Reading_Level 2"). A Study_Pack has 12 Coverage_Slots.
- **Pack_Library**: The list of Study_Packs saved on the phone.
- **Pack_Maker**: The person who makes a Study_Pack from a Lesson_File and shares the pack.
- **Pack_Preview**: The screen where the Pack_Maker reviews the Lesson_Summaries and every Question, and removes Questions before sharing.
- **Pack_File**: A file ending in PACK_EXTENSION that holds one Study_Pack, used to share packs between phones.
- **Skill**: One of four fixed reading skills that Questions are grouped under: main idea, detail, vocabulary in context, and inference.
- **Question**: A multiple-choice item tied to one Skill and one Reading_Level, with Hints and an Explanation.
- **Reading_Level**: The text difficulty of a Question or Lesson_Summary: 1 (simplest), 2, or 3 (closest to grade level).
- **Path**: The study route the student picks: Catch-up or Practice.
- **Catch-up_Path**: A Path that starts at Reading_Level 1.
- **Practice_Path**: A Path that starts at Reading_Level 2.
- **Study_Session**: One run through a Path, from picking the Path until the session ends and the Mastery_Bars are shown.
- **Available_Question**: A Question in the open Study_Pack that has not been answered in the current Study_Session and has no Problem_Flag on this phone.
- **Coach**: The part of the App that responds to answers with Hints and Explanations. Plain code, no AI.
- **Hint**: A short clue shown after a wrong answer, linked to a Source_Paragraph.
- **Explanation**: The correct answer plus a short reason, linked to a Source_Paragraph.
- **AI_Label**: The text "AI-made, check with your teacher" shown on Study_Pack screens.
- **Problem_Flag**: A "report a problem" mark the student puts on a Question, saved on the phone. A Question with a Problem_Flag is skipped on this phone from then on.
- **Glossary_Card**: A flashcard with a lesson term in English on one side, and on the other side the Filipino term plus a one-sentence plain-words meaning.
- **Flashcard_Session**: One run through the Glossary_Cards of a Study_Pack, using "got it" and "show again".
- **Mastery_Bar**: A bar from 0% to 100% showing how well the student knows one Skill.
- **Read_Aloud**: The button that reads Question text or Lesson_Summary text aloud using the browser's speech feature.
- **Progress_Store**: The on-phone storage for packs, progress, Problem_Flags, and settings.
- **Reference_Device**: A Realme C25s (about 4 GB memory, Android 11) running Chrome. The Device_Check proposes Lite_Mode on the Reference_Device.

## Requirements

### Requirement 1: First-Run Device Check and Lite Mode

**User Story:** As a Grade 7 student on a low-end or shared phone with prepaid data, I want the App to suggest a lighter mode for my phone, so that the App runs smoothly and saves my data.

#### Acceptance Criteria

1. WHEN the App opens for the first time on a phone, THE Device_Check SHALL read the device memory value and the data-saver setting from the browser.
2. WHEN the device memory value is 4 GB or less, or the data-saver setting is on, THE Device_Check SHALL propose Lite_Mode.
3. WHEN the device memory value is more than 4 GB and the data-saver setting is off, THE Device_Check SHALL propose Standard_Mode.
4. IF the browser does not provide the device memory value or the data-saver setting, THEN THE Device_Check SHALL use only the value that is available, and SHALL propose Standard_Mode when neither value is available.
5. WHEN the Device_Check proposes a mode, THE App SHALL ask the student to confirm the proposed mode or pick the other mode before continuing.
6. THE App SHALL let the student switch between Lite_Mode and Standard_Mode in settings at any time.
7. WHILE Lite_Mode is on, THE App SHALL show screens with no animations or transitions.
8. WHILE Lite_Mode is on, THE Importer SHALL accept Lesson_Files up to 5 MB, and WHILE Standard_Mode is on, THE Importer SHALL accept Lesson_Files up to 20 MB.
9. IF a Lesson_File is larger than the limit for the current mode, THEN THE Importer SHALL stop the import and show a message with the file size and the limit.

### Requirement 2: Import a Lesson File

**User Story:** As a Pack_Maker, I want to open the lesson file the teacher sent, so that the App can read the lesson text.

#### Acceptance Criteria

1. WHEN the Pack_Maker picks a PDF Lesson_File, THE Importer SHALL extract the Lesson_Text on the phone.
2. WHEN the Importer extracts Lesson_Text, THE Importer SHALL split the Lesson_Text into numbered Source_Paragraphs.
3. IF a PDF Lesson_File has no extractable text (for example, a scanned image), THEN THE Importer SHALL show a message that scanned files are not supported.
4. IF the Pack_Maker picks a file that is not a PDF or PPTX, THEN THE Importer SHALL show a message listing the supported file types.
5. OPTIONAL (build last, only after the full study loop works): WHEN the Pack_Maker picks a PPTX Lesson_File, THE Importer SHALL extract the Lesson_Text from the slide text on the phone.

### Requirement 3: Make a Study Pack Once

**User Story:** As a Pack_Maker, I want the lesson turned into a study pack one time, so that every classmate can study it without using AI or data again.

#### Acceptance Criteria

1. IF the Lesson_Text is longer than MAX_LESSON_CHARS, THEN THE App SHALL ask the Pack_Maker to pick a Page_Range, and SHALL use only the Lesson_Text from that Page_Range, repeating the request until the Lesson_Text is at most MAX_LESSON_CHARS.
2. WHEN the Lesson_Text is at most MAX_LESSON_CHARS (after any Page_Range is applied), THE App SHALL compute the Fingerprint of that final Lesson_Text on the phone.
3. WHEN the Fingerprint matches a Study_Pack in the Pack_Library, THE App SHALL open the saved Study_Pack without contacting the Pack_Service.
4. WHEN the Fingerprint matches no Study_Pack in the Pack_Library, THE App SHALL send the final Lesson_Text to the Pack_Service one time.
5. WHEN the Pack_Service receives Lesson_Text, THE Pack_Service SHALL return one Study_Pack as JSON.
6. THE Pack_Service SHALL discard the Lesson_Text and the Study_Pack after sending the response.
7. THE Study_Pack SHALL contain the Source_Paragraphs, one Lesson_Summary for each of Reading_Levels 1, 2, and 3, Questions for the four Skills, two Hints and one Explanation for each Question, and Glossary_Cards with English text, Filipino text, and a one-sentence plain-words meaning.
8. THE Study_Pack SHALL link every Hint and every Explanation to one Source_Paragraph number, and every Lesson_Summary to one or more Source_Paragraph numbers.
9. WHEN the App receives a Study_Pack from the Pack_Service, THE App SHALL run the Pack_Format_Check and the Full_Coverage_Check, and SHALL save a Study_Pack that passes both checks to the Pack_Library with the Fingerprint.
10. IF the Pack_Service returns an error, does not respond within PACK_TIMEOUT_SECONDS, or returns a Study_Pack that fails the Pack_Format_Check or the Full_Coverage_Check, THEN THE App SHALL show a friendly message with a "Try again" button and save nothing.
11. IF the phone has no internet when a new Study_Pack is needed, THEN THE App SHALL show a message that making a pack needs internet once.
12. FOR ALL valid Study_Packs, converting the Study_Pack to JSON and parsing the JSON back SHALL produce an equal Study_Pack (round-trip property).

### Requirement 4: Preview and Share a Study Pack

**User Story:** As a Pack_Maker, I want to check the pack and remove bad questions before sharing, so that classmates only get questions that make sense.

Note: the 12-Question minimum (Full_Coverage_Check) applies only to the Study_Pack received from the Pack_Service in Requirement 3. Removing Questions in the Pack_Preview can leave a Coverage_Slot empty. For that reason, opening a Pack_File uses only the Pack_Format_Check (valid structure and at least 1 Question), not the Full_Coverage_Check.

#### Acceptance Criteria

1. WHEN a new Study_Pack is saved, THE App SHALL open the Pack_Preview showing the three Lesson_Summaries and every Question with its answer choices, Hints, Explanation, and linked Source_Paragraph.
2. WHEN the Pack_Maker removes a Question in the Pack_Preview, THE App SHALL delete the Question from the saved Study_Pack.
3. IF removing a Question would leave the Study_Pack with 0 Questions, THEN THE App SHALL keep the Question and show a message that a pack needs at least 1 Question.
4. WHEN removing a Question leaves a Coverage_Slot with no Questions, THE Pack_Preview SHALL show a warning naming the empty Skill and Reading_Level.
5. WHEN the Pack_Maker taps "Share", THE App SHALL export the Study_Pack as a Pack_File named with PACK_EXTENSION.
6. WHEN a student opens a Pack_File, THE App SHALL run the Pack_Format_Check on the Study_Pack inside and save a Study_Pack that passes to the Pack_Library.
7. IF an opened Pack_File fails the Pack_Format_Check, THEN THE App SHALL show a message that the file is not a valid pack and save nothing.
8. FOR ALL Study_Packs that pass the Pack_Format_Check, exporting to a Pack_File and importing the Pack_File SHALL produce an equal Study_Pack (round-trip property).

### Requirement 5: Study Offline on a Path

**User Story:** As a Grade 7 student who reads below grade level, I want a summary and questions at a reading level I can follow, with read-aloud, so that I can understand the lesson step by step.

#### Acceptance Criteria

1. WHEN the student opens a Study_Pack, THE App SHALL ask the student to pick the Catch-up_Path or the Practice_Path.
2. WHEN the student picks the Catch-up_Path, THE App SHALL start a Study_Session at Reading_Level 1.
3. WHEN the student picks the Practice_Path, THE App SHALL start a Study_Session at Reading_Level 2.
4. WHEN a Study_Session starts, THE App SHALL show the Lesson_Summary at the starting Reading_Level, with links to its Source_Paragraphs, before showing any Question.
5. WHEN the App picks the next Question, THE App SHALL pick an Available_Question at the current Reading_Level, or an Available_Question at the nearest Reading_Level when the current Reading_Level has none.
6. WHEN the student answers 3 Questions in a row correctly on the first try, THE App SHALL raise the Reading_Level by 1, up to a maximum of 3.
7. WHEN the student answers 2 Questions in a row wrong on the first try, THE App SHALL lower the Reading_Level by 1, down to a minimum of 1.
8. THE App SHALL keep the Reading_Level between 1 and 3.
9. WHEN the student has answered 8 Questions in the Study_Session, or no Available_Question remains, THE App SHALL end the Study_Session and show the Mastery_Bars.
10. WHEN the student taps Read_Aloud on a Question, THE App SHALL read the Question text and answer choices aloud.
11. WHEN the student taps Read_Aloud on a Lesson_Summary, THE App SHALL read the Lesson_Summary text aloud.
12. IF the phone has no speech voice available, THEN THE App SHALL hide the Read_Aloud button.

### Requirement 6: Coach Wrong Answers and AI Safety

**User Story:** As a Grade 7 student, I want help when I get an answer wrong, with a link to the part of the lesson it comes from, so that I learn the idea instead of just seeing "wrong".

#### Acceptance Criteria

1. WHEN the student gives a wrong answer for the first time on a Question, THE Coach SHALL show the first Hint and let the student try again.
2. WHEN the student gives a wrong answer for the second time on a Question, THE Coach SHALL show the second Hint and let the student try again.
3. WHEN the student gives a wrong answer for the third time on a Question, THE Coach SHALL show the Explanation with the correct answer.
4. WHEN the student gives a correct answer, THE Coach SHALL show a short praise message and the Explanation.
5. WHEN the Coach shows a Hint or an Explanation, THE Coach SHALL show a link to the linked Source_Paragraph.
6. WHEN the student taps a Source_Paragraph link, THE App SHALL show the text of that Source_Paragraph.
7. WHILE a Study_Pack is open, THE App SHALL show the AI_Label.
8. WHEN the student taps "report a problem" on a Question, THE App SHALL save a Problem_Flag for that Question in the Progress_Store and move to the next Question.
9. WHILE a Question has a Problem_Flag on this phone, THE App SHALL skip that Question in every Study_Session on this phone.
10. WHEN the Pack_Preview shows a Question with a Problem_Flag on this phone, THE App SHALL mark that Question as reported.

### Requirement 7: Glossary Flashcards and Mastery Progress

**User Story:** As a Grade 7 student, I want to practice key words in English and Filipino and see which skills I know, so that I know what to study next.

#### Acceptance Criteria

1. WHEN the student starts a Flashcard_Session, THE App SHALL show the Glossary_Cards of the Study_Pack one at a time with the English side first.
2. WHEN the student taps a Glossary_Card, THE App SHALL show the Filipino side with the one-sentence plain-words meaning.
3. WHEN the student taps "got it", THE App SHALL remove the Glossary_Card from the current Flashcard_Session.
4. WHEN the student taps "show again", THE App SHALL put the Glossary_Card back 3 cards later in the current Flashcard_Session, or at the end when fewer than 3 cards remain.
5. WHEN every Glossary_Card in the Flashcard_Session is marked "got it", THE App SHALL end the Flashcard_Session and show the number of cards done.
6. THE App SHALL show one Mastery_Bar per Skill, equal to the percent of answered Questions in that Skill that the student got right on the first try.
7. WHEN the student answers a Question, THE App SHALL update the Mastery_Bar for that Question's Skill in the Progress_Store.

### Requirement 8: Privacy, Offline Use, and Device Acceptance

**User Story:** As a Grade 7 student on a shared phone with prepaid data, I want the App to work with no internet and keep my data private, so that I can study anywhere and nobody else sees my progress.

#### Acceptance Criteria

1. THE App SHALL work with no account, no login, and no name entry.
2. THE App SHALL store all progress, Problem_Flags, settings, and Study_Packs only in the Progress_Store on the phone.
3. WHEN the App loads once with internet, THE App SHALL save all app files on the phone so the App opens with no internet.
4. WHILE the phone has no internet, THE App SHALL run the full study loop for any saved Study_Pack: open the pack, pick a Path, read the Lesson_Summary, answer Questions, get Hints and Explanations, open Source_Paragraphs, run a Flashcard_Session, and see Mastery_Bars.
5. WHEN the student taps "Delete my data", THE App SHALL ask the student to confirm before deleting.
6. WHEN the student confirms "Delete my data", THE App SHALL clear the Progress_Store and saved settings and return to the first-run Device_Check.
7. WHILE the Reference_Device is in airplane mode with a saved Study_Pack and Lite_Mode on, THE App SHALL complete the full study loop from criterion 4 with no error messages.

## Stretch

Built only after the full study loop works on the Reference_Device. No tasks yet.

- Forgiving streak: count study days; missing one day does not reset the streak.
- Parent screen: show progress in two plain Filipino sentences with one tip.

## Out of Scope

- Accounts and login
- Teacher dashboard
- OCR for scanned files
- On-device AI model
- Class QR goals
- Math answer checking
- DOCX import
- Advance path
- Spaced-review scheduling (boxes, due dates)
