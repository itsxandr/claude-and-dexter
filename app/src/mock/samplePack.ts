/**
 * Mock StudyPack — Photosynthesis (Grade 8 Science)
 *
 * 24 questions: 2 per Coverage_Slot (4 skills × 3 levels × 2 = 24).
 * Exact StudyPack shape from design.md.
 */

import type { StudyPack } from '../logic/types'

// ── Pack ───────────────────────────────────────────────────────────────────

export const samplePack: StudyPack = {
  formatVersion: 1,
  id: 'a3f1c2d4e5b6a7f8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
  title: 'Photosynthesis',
  createdAt: '2026-09-01T08:00:00.000Z',

  // ── Source paragraphs ──────────────────────────────────────────────────
  paragraphs: [
    { n: 1,  text: 'Plants are living things that make their own food. They do not need to eat other animals or plants. Instead, they use sunlight, water, and air to produce the food they need to grow and live.' },
    { n: 2,  text: 'The process by which plants make food is called photosynthesis. The word comes from Greek: "photo" means light, and "synthesis" means putting together. So photosynthesis means using light to put things together.' },
    { n: 3,  text: 'Photosynthesis takes place inside the chloroplast. The chloroplast is a small part found inside plant cells. It contains a green pigment called chlorophyll. Chlorophyll is what gives leaves their green colour.' },
    { n: 4,  text: 'Plants take in carbon dioxide from the air through tiny openings in their leaves called stomata. Carbon dioxide is the gas that people and animals breathe out. The stomata open during the day to let this gas in.' },
    { n: 5,  text: 'Water is absorbed by the roots of the plant. It travels up through the stem and into the leaves. The water and carbon dioxide meet inside the chloroplast where photosynthesis happens.' },
    { n: 6,  text: 'When light hits the chlorophyll, the plant uses that energy to turn carbon dioxide and water into glucose. Glucose is a simple sugar. The plant uses glucose as food to grow, make seeds, and repair itself.' },
    { n: 7,  text: 'Oxygen is released as a by-product of photosynthesis. A by-product is something made during a process that was not the main goal. The oxygen goes out through the stomata and into the air we breathe.' },
    { n: 8,  text: 'The overall equation for photosynthesis is: carbon dioxide + water + light energy → glucose + oxygen. This shows the raw materials going in and the products coming out.' },
    { n: 9,  text: 'Leaves are shaped and arranged to catch as much sunlight as possible. Most leaves are flat and wide. The top surface faces the sky to absorb light directly. Leaves also have a thin, clear outer layer called the cuticle that stops them from drying out.' },
    { n: 10, text: 'Without photosynthesis, life on Earth would not exist as we know it. Plants form the base of almost every food chain. They produce the oxygen that animals and humans need to breathe, and the glucose that becomes the starting point for all food energy.' },
  ],

  // ── Summaries ──────────────────────────────────────────────────────────
  summaries: [
    { level: 1, text: 'Plants make their own food using sunlight. This is called photosynthesis. It happens inside the chloroplast. Plants take in carbon dioxide and water. They make glucose and release oxygen.', paragraphs: [1, 2, 3, 6, 7] },
    { level: 2, text: 'Photosynthesis is the process plants use to make food. It takes place in the chloroplast, which holds green chlorophyll. The plant takes in carbon dioxide through the stomata and absorbs water through the roots. Using light energy, it converts these into glucose and releases oxygen as a by-product.', paragraphs: [2, 3, 4, 5, 6, 7] },
    { level: 3, text: 'Photosynthesis is the biochemical process by which plants convert light energy into chemical energy stored as glucose. The reaction occurs in the chloroplasts, which contain chlorophyll to absorb light. Carbon dioxide enters via the stomata and water is transported from the roots. The overall equation is: CO₂ + H₂O + light energy → C₆H₁₂O₆ + O₂. Oxygen is released as a by-product, making photosynthesis essential for all aerobic life.', paragraphs: [2, 3, 4, 5, 6, 7, 8, 10] },
  ],

  // ── Questions: 24 total — 2 per slot (4 skills × 3 levels × 2) ────────
  questions: [

    // ════════════════════════════════════════════════════════════════
    // main_idea  Level 1
    // ════════════════════════════════════════════════════════════════
    {
      id: 'q1', skill: 'main_idea', level: 1,
      prompt: 'What do plants use to make their own food?',
      choices: ['Sunlight, water, and air', 'Soil and rain only', 'Other plants', 'Sugar from the ground'],
      answerIndex: 0,
      hints: [
        { text: 'Think about what a plant gets from outside — not from the ground alone.', paragraph: 1 },
        { text: 'Paragraph 1 lists three things plants use.', paragraph: 1 },
      ],
      explanation: { text: 'Plants use sunlight, water, and air (carbon dioxide) to make their own food through photosynthesis.', paragraph: 1 },
    },
    {
      id: 'q2', skill: 'main_idea', level: 1,
      prompt: 'What is photosynthesis?',
      choices: ['The way plants make food using light', 'The way roots drink water', 'How seeds grow into plants', 'How animals find food'],
      answerIndex: 0,
      hints: [
        { text: 'Look at paragraph 2 — it defines this word directly.', paragraph: 2 },
        { text: '"Photo" means light. "Synthesis" means putting together.', paragraph: 2 },
      ],
      explanation: { text: 'Photosynthesis is the process by which plants use light to make food.', paragraph: 2 },
    },

    // ════════════════════════════════════════════════════════════════
    // main_idea  Level 2
    // ════════════════════════════════════════════════════════════════
    {
      id: 'q3', skill: 'main_idea', level: 2,
      prompt: 'What is the main purpose of photosynthesis?',
      choices: ['To produce food for the plant', 'To absorb water from the soil', 'To release carbon dioxide', 'To grow roots deeper'],
      answerIndex: 0,
      hints: [
        { text: '"Synthesis" means putting things together. What is the plant building?', paragraph: 2 },
        { text: 'Paragraph 6 tells you what the plant does with the product it makes.', paragraph: 6 },
      ],
      explanation: { text: 'Photosynthesis lets plants produce glucose, their food, to grow, make seeds, and repair themselves.', paragraph: 6 },
    },
    {
      id: 'q4', skill: 'main_idea', level: 2,
      prompt: 'Which statement best describes the overall result of photosynthesis?',
      choices: [
        'Plants convert light, CO₂, and water into glucose and oxygen',
        'Plants convert glucose into carbon dioxide and water',
        'Plants absorb oxygen from the air and release carbon dioxide',
        'Plants break down sunlight into heat energy',
      ],
      answerIndex: 0,
      hints: [
        { text: 'Paragraph 8 states the equation. Look at what goes in and what comes out.', paragraph: 8 },
        { text: 'The arrow means "produces". Raw materials are on the left; products on the right.', paragraph: 8 },
      ],
      explanation: { text: 'The overall equation is CO₂ + H₂O + light → glucose + O₂. Plants take in and produce those things.', paragraph: 8 },
    },

    // ════════════════════════════════════════════════════════════════
    // main_idea  Level 3
    // ════════════════════════════════════════════════════════════════
    {
      id: 'q5', skill: 'main_idea', level: 3,
      prompt: 'Why is photosynthesis described as essential for all life on Earth?',
      choices: [
        'It produces the oxygen and food energy that nearly all living things depend on',
        'It keeps the soil moist and fertile',
        'It removes harmful gases that cause disease',
        'It allows plants to reproduce without seeds',
      ],
      answerIndex: 0,
      hints: [
        { text: 'Paragraph 10 explains what would happen without photosynthesis.', paragraph: 10 },
        { text: 'Think about two things plants provide: a gas animals breathe and an energy source.', paragraph: 10 },
      ],
      explanation: { text: 'Plants produce oxygen for breathing and glucose that forms the base of almost every food chain, making photosynthesis the foundation of life.', paragraph: 10 },
    },
    {
      id: 'q6', skill: 'main_idea', level: 3,
      prompt: 'Which claim is best supported by the entire passage?',
      choices: [
        'Photosynthesis is the central process linking solar energy to the food and oxygen all life depends on',
        'Photosynthesis only matters to plants, not to animals or humans',
        'Plants can survive and grow without sunlight if they have enough water',
        'Oxygen is the main product plants need to survive',
      ],
      answerIndex: 0,
      hints: [
        { text: 'Paragraphs 1, 6, and 10 together describe what plants produce and why it matters.', paragraph: 10 },
        { text: 'Consider both products of photosynthesis and who uses them.', paragraph: 7 },
      ],
      explanation: { text: 'The passage shows that sunlight → glucose (food) + oxygen, and both are used by nearly all living things, making photosynthesis central to life.', paragraph: 10 },
    },

    // ════════════════════════════════════════════════════════════════
    // detail  Level 1
    // ════════════════════════════════════════════════════════════════
    {
      id: 'q7', skill: 'detail', level: 1,
      prompt: 'Where in the plant cell does photosynthesis take place?',
      choices: ['Chloroplast', 'Nucleus', 'Mitochondria', 'Cell wall'],
      answerIndex: 0,
      hints: [
        { text: 'Look for the part that holds the green pigment.', paragraph: 3 },
        { text: 'Its name starts with "chloro" — the same root as chlorophyll.', paragraph: 3 },
      ],
      explanation: { text: 'Photosynthesis happens in the chloroplast, which contains the green pigment chlorophyll.', paragraph: 3 },
    },
    {
      id: 'q8', skill: 'detail', level: 1,
      prompt: 'How does water get from the ground into the leaves?',
      choices: ['Roots absorb it and it travels up the stem', 'Leaves soak it from rain', 'Stomata pull water from the air', 'The cuticle absorbs water from the sky'],
      answerIndex: 0,
      hints: [
        { text: 'Paragraph 5 describes the path water takes inside the plant.', paragraph: 5 },
        { text: 'It starts underground and moves upward.', paragraph: 5 },
      ],
      explanation: { text: 'Water is absorbed by the roots and travels up through the stem into the leaves.', paragraph: 5 },
    },

    // ════════════════════════════════════════════════════════════════
    // detail  Level 2
    // ════════════════════════════════════════════════════════════════
    {
      id: 'q9', skill: 'detail', level: 2,
      prompt: 'How does carbon dioxide get into a leaf?',
      choices: [
        'Through tiny openings called stomata',
        'Through the roots and up the stem',
        'Through the cuticle on the leaf surface',
        'Through the chlorophyll pigment',
      ],
      answerIndex: 0,
      hints: [
        { text: 'Paragraph 4 describes how carbon dioxide enters the leaf.', paragraph: 4 },
        { text: 'The openings are very small and have a Greek-sounding name.', paragraph: 4 },
      ],
      explanation: { text: 'Carbon dioxide enters through the stomata — tiny openings that open during the day.', paragraph: 4 },
    },
    {
      id: 'q10', skill: 'detail', level: 2,
      prompt: 'What does the plant use glucose for?',
      choices: ['To grow, make seeds, and repair itself', 'To produce carbon dioxide', 'To make water inside its cells', 'To keep its roots cool'],
      answerIndex: 0,
      hints: [
        { text: 'Paragraph 6 lists three things the plant does with the glucose it makes.', paragraph: 6 },
        { text: 'Think about what any living thing needs food for.', paragraph: 6 },
      ],
      explanation: { text: 'The plant uses glucose as food to grow, make seeds, and repair itself.', paragraph: 6 },
    },

    // ════════════════════════════════════════════════════════════════
    // detail  Level 3
    // ════════════════════════════════════════════════════════════════
    {
      id: 'q11', skill: 'detail', level: 3,
      prompt: 'According to the text, what are the raw materials and products in the photosynthesis equation?',
      choices: [
        'Raw materials: CO₂, H₂O, light; Products: glucose, oxygen',
        'Raw materials: glucose, oxygen; Products: CO₂, H₂O',
        'Raw materials: CO₂, glucose; Products: H₂O, light',
        'Raw materials: H₂O, oxygen; Products: CO₂, glucose',
      ],
      answerIndex: 0,
      hints: [
        { text: 'Paragraph 8 states the equation. The left side of the arrow are raw materials.', paragraph: 8 },
        { text: 'The right side of the arrow are the products.', paragraph: 8 },
      ],
      explanation: { text: 'CO₂ + H₂O + light → glucose + oxygen. The left side goes in; the right side comes out.', paragraph: 8 },
    },
    {
      id: 'q12', skill: 'detail', level: 3,
      prompt: 'Why do leaves have a cuticle, according to paragraph 9?',
      choices: [
        'To stop the leaf from drying out',
        'To absorb carbon dioxide more easily',
        'To make the leaf heavier so it faces the sun',
        'To hold chlorophyll in place',
      ],
      answerIndex: 0,
      hints: [
        { text: 'Paragraph 9 mentions the cuticle and gives a reason for it.', paragraph: 9 },
        { text: 'The cuticle is described as "thin and clear" — what does it protect against?', paragraph: 9 },
      ],
      explanation: { text: 'The cuticle is a thin, clear outer layer that stops the leaf from drying out.', paragraph: 9 },
    },

    // ════════════════════════════════════════════════════════════════
    // vocabulary  Level 1
    // ════════════════════════════════════════════════════════════════
    {
      id: 'q13', skill: 'vocabulary', level: 1,
      prompt: 'What does "chlorophyll" mean in the lesson?',
      choices: ['The green pigment inside the chloroplast', 'A type of sugar made by the plant', 'The gas plants breathe in', 'The tiny openings in a leaf'],
      answerIndex: 0,
      hints: [
        { text: 'Paragraph 3 defines this word right after using it.', paragraph: 3 },
        { text: 'It is described as a green pigment — something that gives colour.', paragraph: 3 },
      ],
      explanation: { text: 'Chlorophyll is the green pigment inside the chloroplast that captures sunlight.', paragraph: 3 },
    },
    {
      id: 'q14', skill: 'vocabulary', level: 1,
      prompt: 'What are "stomata"?',
      choices: ['Tiny openings in the leaf', 'Parts of the root that absorb water', 'Green pigments in the leaf', 'Sugar made during photosynthesis'],
      answerIndex: 0,
      hints: [
        { text: 'Paragraph 4 introduces and defines this word.', paragraph: 4 },
        { text: 'They are described as very small and let a gas in.', paragraph: 4 },
      ],
      explanation: { text: 'Stomata are tiny openings in the leaves that let carbon dioxide in and oxygen out.', paragraph: 4 },
    },

    // ════════════════════════════════════════════════════════════════
    // vocabulary  Level 2
    // ════════════════════════════════════════════════════════════════
    {
      id: 'q15', skill: 'vocabulary', level: 2,
      prompt: 'The text says oxygen is a "by-product" of photosynthesis. What does by-product mean here?',
      choices: [
        'Something made during the process that was not the main goal',
        'The main product the plant needs to survive',
        'A raw material used at the start of the process',
        'A waste gas that harms the plant',
      ],
      answerIndex: 0,
      hints: [
        { text: 'Paragraph 7 defines "by-product" in plain words right after the term.', paragraph: 7 },
        { text: 'The main goal of photosynthesis is glucose. So a by-product is…?', paragraph: 7 },
      ],
      explanation: { text: 'A by-product is something produced during a process that was not the main goal. Oxygen is produced alongside glucose but is not what the plant was "trying" to make.', paragraph: 7 },
    },
    {
      id: 'q16', skill: 'vocabulary', level: 2,
      prompt: 'In paragraph 6, what does "glucose" mean?',
      choices: ['A simple sugar the plant uses as food', 'A gas the plant breathes in', 'The green pigment in leaves', 'The water in the plant\'s stem'],
      answerIndex: 0,
      hints: [
        { text: 'Paragraph 6 defines glucose the sentence after it first appears.', paragraph: 6 },
        { text: 'It is described as something the plant uses as food.', paragraph: 6 },
      ],
      explanation: { text: 'Glucose is a simple sugar that the plant produces during photosynthesis and uses as its main food and energy source.', paragraph: 6 },
    },

    // ════════════════════════════════════════════════════════════════
    // vocabulary  Level 3
    // ════════════════════════════════════════════════════════════════
    {
      id: 'q17', skill: 'vocabulary', level: 3,
      prompt: 'In paragraph 2, "photosynthesis" is broken into Greek roots. What does this etymology tell you about how the process works?',
      choices: [
        'It uses light ("photo") to build or assemble ("synthesis") new substances',
        'It uses light to break substances apart into simpler pieces',
        'It stores light energy directly without changing any chemicals',
        'It converts light into heat rather than chemical energy',
      ],
      answerIndex: 0,
      hints: [
        { text: 'Paragraph 2 breaks the word down: "photo" = light, "synthesis" = putting together.', paragraph: 2 },
        { text: '"Synthesis" in chemistry means building a new compound from simpler parts.', paragraph: 2 },
      ],
      explanation: { text: '"Photo" = light, "synthesis" = putting together. Photosynthesis literally means using light to build new substances — in this case glucose from CO₂ and H₂O.', paragraph: 2 },
    },
    {
      id: 'q18', skill: 'vocabulary', level: 3,
      prompt: 'Paragraph 9 says leaves have a "cuticle." Based on context, which meaning fits best?',
      choices: [
        'A thin protective coating on the outer surface',
        'A thick layer of cells that produce chlorophyll',
        'A network of veins that carry water',
        'A type of stomata that regulates gas exchange',
      ],
      answerIndex: 0,
      hints: [
        { text: 'Paragraph 9 describes the cuticle as thin and clear, and gives its function.', paragraph: 9 },
        { text: 'Its function is to prevent something from escaping — think about what plants lose.', paragraph: 9 },
      ],
      explanation: { text: 'The cuticle is described as a thin, clear outer layer. Its function (stopping drying out) tells us it is a protective coating on the leaf surface.', paragraph: 9 },
    },

    // ════════════════════════════════════════════════════════════════
    // inference  Level 1
    // ════════════════════════════════════════════════════════════════
    {
      id: 'q19', skill: 'inference', level: 1,
      prompt: 'Why do you think most leaves are flat and wide?',
      choices: ['To catch as much sunlight as possible', 'To store water inside the leaf', 'To make it easier for insects to land', 'To help the plant stay warm at night'],
      answerIndex: 0,
      hints: [
        { text: 'Paragraph 9 says leaves are shaped to catch sunlight. What shape catches the most?', paragraph: 9 },
        { text: 'Think about holding a piece of paper flat versus rolled up in sunlight.', paragraph: 9 },
      ],
      explanation: { text: 'Flat, wide leaves expose the largest surface area to sunlight, so the plant captures more light for photosynthesis.', paragraph: 9 },
    },
    {
      id: 'q20', skill: 'inference', level: 1,
      prompt: 'If a plant has no water, what will happen to its food-making?',
      choices: ['It will stop making food', 'It will make more food', 'It will use sunlight instead of water', 'It will take water from the air'],
      answerIndex: 0,
      hints: [
        { text: 'Water is one of the raw materials for photosynthesis. What happens if a raw material is missing?', paragraph: 5 },
        { text: 'Think about baking: if you run out of flour, can you still make the bread?', paragraph: 5 },
      ],
      explanation: { text: 'Water is a required raw material for photosynthesis. Without it, the plant cannot carry out the reaction and food production stops.', paragraph: 5 },
    },

    // ════════════════════════════════════════════════════════════════
    // inference  Level 2
    // ════════════════════════════════════════════════════════════════
    {
      id: 'q21', skill: 'inference', level: 2,
      prompt: 'A plant is kept in a dark room for a week. What would most likely happen and why?',
      choices: [
        'It would weaken because it cannot make glucose without light',
        'It would grow faster because it saves energy in the dark',
        'It would produce more oxygen to compensate for the darkness',
        'It would not be affected because roots supply all the food it needs',
      ],
      answerIndex: 0,
      hints: [
        { text: 'Light is needed for photosynthesis. What happens if the plant cannot make food?', paragraph: 6 },
        { text: 'Paragraph 6 explains that glucose is the plant\'s food for growth and repair.', paragraph: 6 },
      ],
      explanation: { text: 'Without light, photosynthesis cannot occur, so the plant cannot produce glucose. With no food it would weaken and eventually die.', paragraph: 6 },
    },
    {
      id: 'q22', skill: 'inference', level: 2,
      prompt: 'If carbon dioxide were removed from the air, what would happen to plants?',
      choices: [
        'They could not make glucose and would eventually die',
        'They would produce more oxygen to replace the missing gas',
        'They would switch to using nitrogen instead',
        'They would grow faster because they would not need to process CO₂',
      ],
      answerIndex: 0,
      hints: [
        { text: 'Carbon dioxide is listed as a raw material in paragraph 8.', paragraph: 8 },
        { text: 'Without a raw material, what happens to the equation?', paragraph: 8 },
      ],
      explanation: { text: 'CO₂ is a required raw material for photosynthesis. Without it the equation cannot proceed, glucose cannot be made, and the plant would die.', paragraph: 8 },
    },

    // ════════════════════════════════════════════════════════════════
    // inference  Level 3
    // ════════════════════════════════════════════════════════════════
    {
      id: 'q23', skill: 'inference', level: 3,
      prompt: 'If a scientist genetically modified a plant so its stomata stayed closed all day, what would be the most likely consequence for photosynthesis?',
      choices: [
        'Photosynthesis would slow or stop because carbon dioxide could not enter',
        'Photosynthesis would speed up because water loss would be reduced',
        'Photosynthesis would be unaffected because CO₂ enters through the roots',
        'Photosynthesis would increase because oxygen would build up inside the leaf',
      ],
      answerIndex: 0,
      hints: [
        { text: 'Paragraph 4 explains that stomata let carbon dioxide in. What if they stay closed?', paragraph: 4 },
        { text: 'Carbon dioxide is a raw material. If it cannot enter, what is missing from the equation?', paragraph: 8 },
      ],
      explanation: { text: 'Carbon dioxide enters through the stomata. If stomata stay closed, CO₂ cannot reach the chloroplasts and the photosynthesis equation cannot proceed.', paragraph: 4 },
    },
    {
      id: 'q24', skill: 'inference', level: 3,
      prompt: 'A student argues that photosynthesis is "just a plant thing" with no importance to humans. Which evidence from the text best refutes this?',
      choices: [
        'Plants produce the oxygen humans breathe and glucose that starts every food chain',
        'Humans can make their own food the same way plants do',
        'Plants only release oxygen at night, when humans are asleep',
        'The equation for photosynthesis does not include any products humans use',
      ],
      answerIndex: 0,
      hints: [
        { text: 'Paragraph 10 directly addresses what life would be like without photosynthesis.', paragraph: 10 },
        { text: 'Paragraph 7 explains what happens to the oxygen produced.', paragraph: 7 },
      ],
      explanation: { text: 'Paragraph 10 states that plants produce the oxygen humans breathe and the glucose that starts almost every food chain — both are used by humans.', paragraph: 10 },
    },
  ],

  // ── Glossary ───────────────────────────────────────────────────────────
  glossary: [
    { en: 'Photosynthesis',  fil: 'Photosynthesis / Pagkain ng Halaman', meaning: 'The process plants use to turn sunlight, water, and carbon dioxide into food (glucose) and oxygen.' },
    { en: 'Chloroplast',     fil: 'Kloroplast',                          meaning: 'The small part inside a plant cell where photosynthesis happens; it contains chlorophyll.' },
    { en: 'Chlorophyll',     fil: 'Kloropil',                            meaning: 'The green pigment inside the chloroplast that captures light energy from the sun.' },
    { en: 'Stomata',         fil: 'Stomata / Butas ng Dahon',            meaning: 'Tiny openings on the surface of leaves that let carbon dioxide in and oxygen out.' },
    { en: 'Glucose',         fil: 'Glukos',                              meaning: 'A simple sugar that plants make during photosynthesis and use as their main source of energy and food.' },
    { en: 'Carbon dioxide',  fil: 'Carbon dioxide / Karbon Dioksido',    meaning: 'A gas found in the air that plants take in through the stomata as a raw material for photosynthesis.' },
    { en: 'By-product',      fil: 'Karagdagang Produkto',                meaning: 'Something that is produced during a process but was not the main goal — like oxygen being made when plants produce glucose.' },
  ],
};
