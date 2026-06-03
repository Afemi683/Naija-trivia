export type Category = "history" | "geography" | "current-affairs";
export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  category: Category;
  difficulty: Difficulty;
  explanation?: string;
}

export const CATEGORIES: Record<Category, { label: string; icon: string; description: string; color: string }> = {
  history: {
    label: "History",
    icon: "book",
    description: "From ancient kingdoms to independence",
    color: "#8B5CF6",
  },
  geography: {
    label: "Geography",
    icon: "map",
    description: "States, rivers, and landmarks",
    color: "#0EA5E9",
  },
  "current-affairs": {
    label: "Current Affairs",
    icon: "trending-up",
    description: "Modern Nigeria and the world",
    color: "#E9A012",
  },
};

export const questions: Question[] = [
  // ─── HISTORY ────────────────────────────────────────────────
  {
    id: "h1",
    question: "In what year did Nigeria gain independence from Britain?",
    options: ["1957", "1960", "1963", "1966"],
    correctIndex: 1,
    category: "history",
    difficulty: "easy",
    explanation: "Nigeria became independent on October 1, 1960.",
  },
  {
    id: "h2",
    question: "Who was Nigeria's first Prime Minister?",
    options: [
      "Nnamdi Azikiwe",
      "Obafemi Awolowo",
      "Abubakar Tafawa Balewa",
      "Ahmadu Bello",
    ],
    correctIndex: 2,
    category: "history",
    difficulty: "easy",
    explanation:
      "Sir Abubakar Tafawa Balewa served as Nigeria's first and only Prime Minister.",
  },
  {
    id: "h3",
    question:
      "Who amalgamated the Northern and Southern Protectorates to form Nigeria in 1914?",
    options: [
      "Sir Hugh Clifford",
      "Lord Frederick Lugard",
      "Sir James Robertson",
      "Sir Arthur Richards",
    ],
    correctIndex: 1,
    category: "history",
    difficulty: "medium",
    explanation:
      "Lord Frederick Lugard merged the two protectorates on January 1, 1914.",
  },
  {
    id: "h4",
    question: "What year did Nigeria become a republic?",
    options: ["1960", "1961", "1963", "1966"],
    correctIndex: 2,
    category: "history",
    difficulty: "medium",
    explanation:
      "Nigeria became a Federal Republic on October 1, 1963, replacing the Queen as head of state.",
  },
  {
    id: "h5",
    question: "Who proclaimed the Republic of Biafra in 1967?",
    options: [
      "Yakubu Gowon",
      "Emeka Odumegwu Ojukwu",
      "Nnamdi Azikiwe",
      "Benjamin Adekunle",
    ],
    correctIndex: 1,
    category: "history",
    difficulty: "easy",
    explanation:
      "Colonel Odumegwu Ojukwu declared the secession of the Eastern Region as the Republic of Biafra.",
  },
  {
    id: "h6",
    question: "In what year did the Nigerian Civil War (Biafra War) end?",
    options: ["1968", "1969", "1970", "1971"],
    correctIndex: 2,
    category: "history",
    difficulty: "easy",
    explanation:
      "The Nigerian Civil War ended on January 15, 1970, with Biafra's surrender.",
  },
  {
    id: "h7",
    question:
      "Who led the first military coup in Nigeria on January 15, 1966?",
    options: [
      "Yakubu Gowon",
      "Ibrahim Babangida",
      "Kaduna Nzeogwu",
      "Murtala Muhammed",
    ],
    correctIndex: 2,
    category: "history",
    difficulty: "medium",
    explanation:
      "Major Chukwuma Kaduna Nzeogwu led the first coup that overthrew the civilian government.",
  },
  {
    id: "h8",
    question: "The Sokoto Caliphate was founded by which Islamic reformer?",
    options: [
      "Muhammadu Bello",
      "Usman dan Fodio",
      "Alhaji Ahmadu Bello",
      "Al-Kanemi",
    ],
    correctIndex: 1,
    category: "history",
    difficulty: "medium",
    explanation:
      "Usman dan Fodio established the Sokoto Caliphate in 1804 after a successful jihad.",
  },
  {
    id: "h9",
    question: "Nigeria's first university was founded in which year?",
    options: ["1945", "1948", "1952", "1960"],
    correctIndex: 1,
    category: "history",
    difficulty: "hard",
    explanation:
      "The University College Ibadan (now University of Ibadan) was founded in 1948.",
  },
  {
    id: "h10",
    question:
      "Who was the Supreme Commander of the Nigerian Armed Forces during the Civil War?",
    options: [
      "Murtala Muhammed",
      "Olusegun Obasanjo",
      "Yakubu Gowon",
      "Theophilus Danjuma",
    ],
    correctIndex: 2,
    category: "history",
    difficulty: "medium",
    explanation:
      "General Yakubu Gowon led the federal government forces throughout the civil war.",
  },
  {
    id: "h11",
    question: "Nigeria returned to civilian rule for the fourth time in which year?",
    options: ["1993", "1999", "2003", "2007"],
    correctIndex: 1,
    category: "history",
    difficulty: "easy",
    explanation:
      "Nigeria's Fourth Republic began on May 29, 1999, after years of military rule.",
  },
  {
    id: "h12",
    question: "Which year was Abuja officially made Nigeria's capital city?",
    options: ["1986", "1991", "1993", "1999"],
    correctIndex: 1,
    category: "history",
    difficulty: "medium",
    explanation:
      "Abuja formally replaced Lagos as the federal capital on December 12, 1991.",
  },
  {
    id: "h13",
    question:
      "The Benin Kingdom is particularly famous for which art form?",
    options: [
      "Terracotta sculptures",
      "Nok terracotta figures",
      "Bronze and brass castings",
      "Calabash carvings",
    ],
    correctIndex: 2,
    category: "history",
    difficulty: "easy",
    explanation:
      "The Benin Kingdom is world-renowned for its exquisite bronze and brass art objects.",
  },
  {
    id: "h14",
    question:
      "Nigeria hosted the Second World Black and African Festival of Arts (FESTAC) in which year?",
    options: ["1975", "1977", "1980", "1983"],
    correctIndex: 1,
    category: "history",
    difficulty: "hard",
    explanation:
      "FESTAC '77 was held in Lagos in January and February 1977, showcasing African culture.",
  },
  {
    id: "h15",
    question: "Who was Nigeria's first indigenous Governor-General?",
    options: [
      "Obafemi Awolowo",
      "Nnamdi Azikiwe",
      "Tafawa Balewa",
      "Ahmadu Bello",
    ],
    correctIndex: 1,
    category: "history",
    difficulty: "medium",
    explanation:
      "Dr. Nnamdi Azikiwe became Nigeria's first indigenous Governor-General in 1960, then President in 1963.",
  },
  {
    id: "h16",
    question: "The Kano Chronicle records the founding of which ancient kingdom?",
    options: [
      "Benin Kingdom",
      "Oyo Empire",
      "Hausa city-state of Kano",
      "Bornu Empire",
    ],
    correctIndex: 2,
    category: "history",
    difficulty: "hard",
    explanation:
      "The Kano Chronicle is a historical account of the Hausa city-state of Kano and its rulers.",
  },
  {
    id: "h17",
    question: "Which colonial name was given to the territory that became northern Nigeria before amalgamation?",
    options: [
      "Gold Coast",
      "Protectorate of Northern Nigeria",
      "Colony of Nigeria",
      "Biafra Territory",
    ],
    correctIndex: 1,
    category: "history",
    difficulty: "medium",
    explanation:
      "The northern territory was called the Protectorate of Northern Nigeria, while the south was the Protectorate of Southern Nigeria.",
  },
  {
    id: "h18",
    question: "General Murtala Muhammed was assassinated in which year?",
    options: ["1975", "1976", "1977", "1978"],
    correctIndex: 1,
    category: "history",
    difficulty: "medium",
    explanation:
      "General Murtala Muhammed was assassinated on February 13, 1976, during a failed coup attempt.",
  },
  {
    id: "h19",
    question: "The Oyo Empire was the dominant power in West Africa during which period?",
    options: [
      "12th–14th centuries",
      "14th–16th centuries",
      "17th–19th centuries",
      "19th–20th centuries",
    ],
    correctIndex: 2,
    category: "history",
    difficulty: "hard",
    explanation:
      "The Oyo Empire reached the peak of its power between the 17th and 19th centuries.",
  },
  {
    id: "h20",
    question: "Who was the first elected President of Nigeria's Fourth Republic?",
    options: [
      "Ernest Shonekan",
      "Moshood Abiola",
      "Olusegun Obasanjo",
      "Umaru Yar'Adua",
    ],
    correctIndex: 2,
    category: "history",
    difficulty: "easy",
    explanation:
      "Olusegun Obasanjo won the 1999 presidential election and served two terms (1999–2007).",
  },

  // ─── GEOGRAPHY ──────────────────────────────────────────────
  {
    id: "g1",
    question: "What is Nigeria's largest state by land area?",
    options: ["Borno", "Niger", "Taraba", "Zamfara"],
    correctIndex: 1,
    category: "geography",
    difficulty: "medium",
    explanation:
      "Niger State is the largest state in Nigeria, covering approximately 76,363 km².",
  },
  {
    id: "g2",
    question: "Nigeria's highest mountain peak, Chappal Waddi, is located in which state?",
    options: ["Plateau", "Adamawa", "Taraba", "Nasarawa"],
    correctIndex: 2,
    category: "geography",
    difficulty: "hard",
    explanation:
      "Chappal Waddi (2,419 m) is located in Taraba State, in the Gotel Mountains.",
  },
  {
    id: "g3",
    question: "How many states make up the Federal Republic of Nigeria?",
    options: ["30", "34", "36", "38"],
    correctIndex: 2,
    category: "geography",
    difficulty: "easy",
    explanation:
      "Nigeria has 36 states plus the Federal Capital Territory (FCT), Abuja.",
  },
  {
    id: "g4",
    question: "Which countries share a border with Nigeria?",
    options: [
      "Ghana, Togo, Benin, Niger",
      "Benin, Niger, Chad, Cameroon",
      "Cameroon, Chad, Sudan, Niger",
      "Benin, Togo, Niger, Cameroon",
    ],
    correctIndex: 1,
    category: "geography",
    difficulty: "easy",
    explanation:
      "Nigeria shares borders with Benin (west), Niger (north), Chad (northeast), and Cameroon (east).",
  },
  {
    id: "g5",
    question: "The Niger River merges with which other major river before reaching the sea?",
    options: ["Benue River", "Cross River", "Sokoto River", "Kaduna River"],
    correctIndex: 0,
    category: "geography",
    difficulty: "easy",
    explanation:
      "The Niger River meets the Benue River at Lokoja, forming the Y-junction.",
  },
  {
    id: "g6",
    question: "Which geopolitical zone in Nigeria has the most states (7 states)?",
    options: ["North-Central", "North-East", "North-West", "South-West"],
    correctIndex: 2,
    category: "geography",
    difficulty: "medium",
    explanation:
      "The North-West zone comprises 7 states: Kano, Katsina, Kaduna, Kebbi, Sokoto, Zamfara, and Jigawa.",
  },
  {
    id: "g7",
    question: "The Sambisa Forest, known for its dense vegetation, is located in which state?",
    options: ["Adamawa", "Yobe", "Borno", "Taraba"],
    correctIndex: 2,
    category: "geography",
    difficulty: "medium",
    explanation:
      "Sambisa Forest is located in Borno State, in northeastern Nigeria.",
  },
  {
    id: "g8",
    question: "Which Nigerian state is closest to Lake Chad?",
    options: ["Yobe", "Borno", "Bauchi", "Gombe"],
    correctIndex: 1,
    category: "geography",
    difficulty: "medium",
    explanation:
      "Borno State shares the Lake Chad Basin with Niger, Chad, and Cameroon.",
  },
  {
    id: "g9",
    question: "The city of Lokoja is significant because it is located at the confluence of which two rivers?",
    options: [
      "Niger and Kaduna",
      "Niger and Benue",
      "Benue and Cross",
      "Niger and Sokoto",
    ],
    correctIndex: 1,
    category: "geography",
    difficulty: "easy",
    explanation:
      "Lokoja, capital of Kogi State, sits at the confluence of the Niger and Benue rivers.",
  },
  {
    id: "g10",
    question: "What is the capital city of Cross River State?",
    options: ["Uyo", "Calabar", "Aba", "Enugu"],
    correctIndex: 1,
    category: "geography",
    difficulty: "easy",
    explanation:
      "Calabar is the capital and largest city of Cross River State.",
  },
  {
    id: "g11",
    question: "Nigeria's coastline stretches along which body of water?",
    options: [
      "Indian Ocean",
      "Gulf of Guinea (Atlantic Ocean)",
      "Mediterranean Sea",
      "South Atlantic Ocean",
    ],
    correctIndex: 1,
    category: "geography",
    difficulty: "easy",
    explanation:
      "Nigeria's 853 km coastline faces the Gulf of Guinea, part of the Atlantic Ocean.",
  },
  {
    id: "g12",
    question: "The Yankari National Park, famous for its wildlife and natural springs, is in which state?",
    options: ["Plateau", "Bauchi", "Niger", "Benue"],
    correctIndex: 1,
    category: "geography",
    difficulty: "medium",
    explanation:
      "Yankari National Park is located in Bauchi State, home to elephants and warm springs.",
  },
  {
    id: "g13",
    question: "The Niger Delta spans primarily across which geopolitical zone?",
    options: ["South-East", "South-South", "South-West", "North-Central"],
    correctIndex: 1,
    category: "geography",
    difficulty: "easy",
    explanation:
      "The Niger Delta is primarily in the South-South zone (Rivers, Delta, Bayelsa, and neighboring states).",
  },
  {
    id: "g14",
    question: "What is the approximate total land area of Nigeria?",
    options: [
      "523,000 km²",
      "723,000 km²",
      "923,000 km²",
      "1,123,000 km²",
    ],
    correctIndex: 2,
    category: "geography",
    difficulty: "hard",
    explanation:
      "Nigeria covers approximately 923,768 km², making it the 32nd largest country in the world.",
  },
  {
    id: "g15",
    question: "The Cross River National Park is UNESCO-listed for its biodiversity. It is home to which endangered primate?",
    options: [
      "Mountain Gorilla",
      "Cross River Gorilla",
      "Bonobo",
      "Eastern Chimpanzee",
    ],
    correctIndex: 1,
    category: "geography",
    difficulty: "hard",
    explanation:
      "The Cross River Gorilla (Gorilla gorilla diehli) is critically endangered and found in Cross River National Park.",
  },
  {
    id: "g16",
    question: "The Jos Plateau is located in which state?",
    options: ["Bauchi", "Benue", "Plateau", "Kaduna"],
    correctIndex: 2,
    category: "geography",
    difficulty: "easy",
    explanation:
      "The Jos Plateau gives Plateau State its name and is known for its cooler climate.",
  },
  {
    id: "g17",
    question: "Which Nigerian city is known as the 'Oil City' and is the hub of the petroleum industry?",
    options: ["Lagos", "Warri", "Port Harcourt", "Yenagoa"],
    correctIndex: 2,
    category: "geography",
    difficulty: "easy",
    explanation:
      "Port Harcourt is Nigeria's oil capital and the seat of the petroleum industry.",
  },
  {
    id: "g18",
    question: "Nigeria's time zone is WAT. What is the UTC offset?",
    options: ["UTC+0", "UTC+1", "UTC+2", "UTC+3"],
    correctIndex: 1,
    category: "geography",
    difficulty: "medium",
    explanation:
      "Nigeria observes West Africa Time (WAT), which is UTC+1.",
  },
  {
    id: "g19",
    question: "The Zuma Rock, a famous natural landmark, is located near which city?",
    options: ["Kano", "Abuja", "Kaduna", "Lokoja"],
    correctIndex: 1,
    category: "geography",
    difficulty: "medium",
    explanation:
      "Zuma Rock (725 m) is a prominent inselberg located near Abuja, on the Kaduna–Abuja highway.",
  },
  {
    id: "g20",
    question: "Which river forms part of Nigeria's eastern border with Cameroon?",
    options: ["River Niger", "Benue River", "Cross River", "Taraba River"],
    correctIndex: 2,
    category: "geography",
    difficulty: "hard",
    explanation:
      "The Cross River flows through southeastern Nigeria and forms part of the border with Cameroon.",
  },

  // ─── CURRENT AFFAIRS ────────────────────────────────────────
  {
    id: "ca1",
    question: "Who became Nigeria's President in May 2023?",
    options: [
      "Muhammadu Buhari",
      "Peter Obi",
      "Atiku Abubakar",
      "Bola Ahmed Tinubu",
    ],
    correctIndex: 3,
    category: "current-affairs",
    difficulty: "easy",
    explanation:
      "Bola Ahmed Tinubu was inaugurated as Nigeria's 16th President on May 29, 2023.",
  },
  {
    id: "ca2",
    question: "The #EndSARS protests in Nigeria were directed against which police unit?",
    options: [
      "Special Anti-Robbery Squad (SARS)",
      "Mobile Police (MOPOL)",
      "Federal Investigation and Intelligence Bureau (FIIB)",
      "Rapid Response Squad (RRS)",
    ],
    correctIndex: 0,
    category: "current-affairs",
    difficulty: "easy",
    explanation:
      "The #EndSARS movement demanded the disbandment of SARS, known for brutality and extortion.",
  },
  {
    id: "ca3",
    question: "In what year did the #EndSARS protests peak across Nigeria?",
    options: ["2018", "2019", "2020", "2021"],
    correctIndex: 2,
    category: "current-affairs",
    difficulty: "easy",
    explanation:
      "The #EndSARS protests erupted in October 2020, reaching a tragic climax at the Lekki Toll Gate.",
  },
  {
    id: "ca4",
    question: "Which Nigerian artiste won the Grammy Award for Best Global Music Album in 2021?",
    options: ["Wizkid", "Burna Boy", "Davido", "Tiwa Savage"],
    correctIndex: 1,
    category: "current-affairs",
    difficulty: "easy",
    explanation:
      "Burna Boy won the Grammy for Best Global Music Album for 'Twice as Tall' in 2021.",
  },
  {
    id: "ca5",
    question: "What is the name of Nigeria's largest refinery, commissioned in 2023?",
    options: [
      "Warri Refinery",
      "Kaduna Refinery",
      "Dangote Refinery",
      "Port Harcourt Refinery",
    ],
    correctIndex: 2,
    category: "current-affairs",
    difficulty: "medium",
    explanation:
      "The Dangote Petroleum Refinery in Lagos, the world's largest single-train refinery, began operations in 2023.",
  },
  {
    id: "ca6",
    question: "What announcement did President Tinubu make on his inauguration day, May 29, 2023?",
    options: [
      "Free education for all Nigerians",
      "End of petrol subsidy",
      "A new national currency",
      "Free healthcare for the poor",
    ],
    correctIndex: 1,
    category: "current-affairs",
    difficulty: "medium",
    explanation:
      "Tinubu declared 'fuel subsidy is gone,' ending decades of government subsidies on petrol.",
  },
  {
    id: "ca7",
    question: "Nigeria is the largest economy in Africa, but which country is second?",
    options: ["South Africa", "Egypt", "Ethiopia", "Kenya"],
    correctIndex: 0,
    category: "current-affairs",
    difficulty: "medium",
    explanation:
      "South Africa is Africa's second-largest economy after Nigeria.",
  },
  {
    id: "ca8",
    question: "The Central Bank of Nigeria's headquarters is located in which city?",
    options: ["Lagos", "Abuja", "Kano", "Port Harcourt"],
    correctIndex: 1,
    category: "current-affairs",
    difficulty: "easy",
    explanation:
      "The CBN headquarters is in Abuja, the nation's capital.",
  },
  {
    id: "ca9",
    question: "INEC stands for what in Nigerian politics?",
    options: [
      "Independent National Electoral Commission",
      "Internal National Election Committee",
      "International Nigerian Election Council",
      "Integrated National Electoral Corporation",
    ],
    correctIndex: 0,
    category: "current-affairs",
    difficulty: "easy",
    explanation:
      "INEC (Independent National Electoral Commission) is responsible for conducting elections in Nigeria.",
  },
  {
    id: "ca10",
    question: "Nigeria's national football team is called the Super Eagles. When did they last win AFCON?",
    options: ["2006", "2010", "2013", "2019"],
    correctIndex: 2,
    category: "current-affairs",
    difficulty: "medium",
    explanation:
      "Nigeria won the Africa Cup of Nations in 2013, hosted in South Africa.",
  },
  {
    id: "ca11",
    question: "Aliko Dangote is consistently ranked as which position in Africa by net worth?",
    options: [
      "Second richest person",
      "Richest person",
      "Third richest person",
      "Fifth richest person",
    ],
    correctIndex: 1,
    category: "current-affairs",
    difficulty: "easy",
    explanation:
      "Aliko Dangote has been Africa's richest person for over a decade.",
  },
  {
    id: "ca12",
    question: "What does NNPC stand for?",
    options: [
      "Nigerian National Petroleum Company",
      "National Nigerian Petroleum Corporation",
      "Niger National Petroleum Council",
      "Nigerian New Petroleum Council",
    ],
    correctIndex: 0,
    category: "current-affairs",
    difficulty: "easy",
    explanation:
      "NNPC (Nigerian National Petroleum Company) is Nigeria's state oil company, renamed from 'Corporation' to 'Company' in 2022.",
  },
  {
    id: "ca13",
    question: "In which year did Nigeria join the African Continental Free Trade Area (AfCFTA)?",
    options: ["2018", "2019", "2020", "2021"],
    correctIndex: 1,
    category: "current-affairs",
    difficulty: "hard",
    explanation:
      "Nigeria signed the AfCFTA agreement in July 2019, one of the last major African economies to do so.",
  },
  {
    id: "ca14",
    question: "What is the name of Nigeria's premier tech hub/innovation city in Lagos?",
    options: [
      "Silicon Valley Nigeria",
      "Yaba Tech Cluster",
      "Lagos Innovation Park",
      "Digital Nigeria Hub",
    ],
    correctIndex: 1,
    category: "current-affairs",
    difficulty: "medium",
    explanation:
      "The Yaba district in Lagos is known as Nigeria's Silicon Valley and houses many tech startups.",
  },
  {
    id: "ca15",
    question: "Wizkid's album 'Made in Lagos' peaked at what position on the UK Albums Chart?",
    options: ["Top 5", "Top 10", "Top 20", "Top 50"],
    correctIndex: 1,
    category: "current-affairs",
    difficulty: "hard",
    explanation:
      "Wizkid's 'Made in Lagos' peaked at No. 7 on the UK Albums Chart, a historic achievement for Afrobeats.",
  },
  {
    id: "ca16",
    question: "What is the name of Nigeria's fast-growing payment and fintech company founded by Shola Akinlade?",
    options: ["Flutterwave", "Paystack", "OPay", "Kuda"],
    correctIndex: 1,
    category: "current-affairs",
    difficulty: "medium",
    explanation:
      "Paystack was founded by Shola Akinlade and Ezra Olubi, and was acquired by Stripe in 2020.",
  },
  {
    id: "ca17",
    question: "The Peter Obi presidential movement in 2023 was popularly known as what?",
    options: [
      "ObiDient Movement",
      "Obidimma Campaign",
      "Obi Nation Movement",
      "Labour Movement",
    ],
    correctIndex: 0,
    category: "current-affairs",
    difficulty: "easy",
    explanation:
      "Supporters of Peter Obi (Labour Party) called themselves 'Obidients.'",
  },
  {
    id: "ca18",
    question: "Which Nigerian state produces the most crude oil?",
    options: ["Rivers", "Delta", "Akwa Ibom", "Bayelsa"],
    correctIndex: 2,
    category: "current-affairs",
    difficulty: "medium",
    explanation:
      "Akwa Ibom State is consistently the highest crude oil-producing state in Nigeria.",
  },
  {
    id: "ca19",
    question: "What is the current minimum wage in Nigeria as approved in 2024?",
    options: ["₦30,000", "₦50,000", "₦70,000", "₦100,000"],
    correctIndex: 2,
    category: "current-affairs",
    difficulty: "hard",
    explanation:
      "The National Minimum Wage was increased to ₦70,000 per month in 2024.",
  },
  {
    id: "ca20",
    question: "Burna Boy's 2023 global tour was named after which album?",
    options: [
      "African Giant",
      "Twice as Tall",
      "Love, Damini",
      "I Told Them",
    ],
    correctIndex: 3,
    category: "current-affairs",
    difficulty: "medium",
    explanation:
      "Burna Boy's 'I Told Them…' album and associated tour was a massive global success in 2023.",
  },
];

export function getQuestionsByCategory(category: Category): Question[] {
  return questions.filter((q) => q.category === category);
}

export function getRandomQuestions(category: Category, count: number = 10): Question[] {
  const pool = getQuestionsByCategory(category);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
