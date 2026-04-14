/**
 * Course data for individual course pages
 * COMPLETE VERSION with assignment descriptions for submission feature
 */

export const courseDetails = {
    1: {
        id: 1,
        code: 'ICS 31',
        name: 'Introduction to Programming',
        professor: 'Prof. Pattis',
        color: 'from-blue-500 to-blue-600',
        description: 'An introduction to the fundamentals of computer programming using Python. Topics include basic data types, control structures, functions, lists, and dictionaries.',
        term: 'Fall 2025',
        credits: 4,
        location: 'ICS 174',
        time: 'MWF 10:00-10:50am',
        officeHours: 'Tuesday 2-4pm, Thursday 3-5pm',
        assignments: [
            {
                id: 1,
                title: 'Assignment 1: Variables and Expressions',
                dueDate: 'Oct 15 at 11:59pm',
                points: 100,
                submitted: true,
                grade: 95,
                description: 'Complete the exercises on Python variables, data types, and basic expressions. This assignment covers integer, float, string, and boolean data types. Submit your .py file with all functions implemented and tested. Make sure to follow proper naming conventions and include docstrings for all functions. Test your code with the provided test cases before submission.'
            },
            {
                id: 2,
                title: 'Assignment 2: Control Flow',
                dueDate: 'Oct 29 at 11:59pm',
                points: 100,
                submitted: true,
                grade: 88,
                description: 'Implement conditional statements and loops to solve the given problems. This assignment tests your understanding of if/elif/else statements, for loops, while loops, and nested control structures. You will create programs that use conditionals to make decisions and loops to repeat actions. Handle edge cases and include proper error checking. Submit a single Python file with all solutions clearly commented.'
            },
            {
                id: 3,
                title: 'Assignment 3: Lists and Tuples',
                dueDate: 'Nov 5 at 11:59pm',
                points: 100,
                submitted: false,
                grade: null,
                description: 'Practice working with Python lists and tuples. Complete all 10 exercises demonstrating list manipulation, slicing, list comprehensions, and tuple operations. You will implement functions that create, modify, and process lists and tuples. This includes sorting, filtering, searching, and transforming data structures. Submit a single Python file with all solutions clearly commented and tested with sample data.'
            },
            {
                id: 4,
                title: 'Assignment 4: Dictionaries',
                dueDate: 'Nov 19 at 11:59pm',
                points: 100,
                submitted: false,
                grade: null,
                description: 'Build a small contact management program using Python dictionaries to store and retrieve data. Implement CRUD operations (Create, Read, Update, Delete) on dictionary data structures. Your program should allow users to add contacts, search for contacts, update contact information, and delete contacts. Include input validation and user-friendly error messages. Demonstrate proper use of dictionary methods like .get(), .items(), .keys(), and .values().'
            }
        ],
        modules: [
            { id: 1, title: 'Week 1: Introduction to Python', completed: true, items: 5 },
            { id: 2, title: 'Week 2: Variables and Data Types', completed: true, items: 6 },
            { id: 3, title: 'Week 3: Control Structures', completed: true, items: 7 },
            { id: 4, title: 'Week 4: Functions', completed: false, items: 6 },
            { id: 5, title: 'Week 5: Lists and Tuples', completed: false, items: 8 }
        ],
        announcements: [
            {
                id: 1,
                title: 'Update: Mandatory Requirement for Tomorrow',
                date: '2 hours ago',
                postedAt: '2026-02-11T17:26:00',
                authorName: 'Carly Suzanne Stevenson',
                authorInitials: 'CS',
                authorRole: 'AUTHOR | TEACHER',
                authorEmail: 'CarlySS@uci.edu',
                authorTitle: 'Senior Career Counselor',
                sections: 2,
                content: 'MECPS Students,\n\nYou will see a **mandatory event** listed on the syllabus for tomorrow. Please note: The event is **NOT** be an in-person class session. There is a **mandatory sign-up** for the Mock Interview Series. Sign-up links will be sent **by end of day Friday**.',
                signatureLine: 'Carly Stevenson, Senior Career Counselor'
            },
            {
                id: 2,
                title: 'Update on Tonight\'s Suggested Event + 1:1 Career Advising Availability',
                date: '1 day ago',
                postedAt: '2026-01-22T08:16:00',
                authorName: 'Carly Suzanne Stevenson',
                authorInitials: 'CS',
                authorRole: 'AUTHOR | TEACHER',
                authorEmail: 'CarlySS@uci.edu',
                authorTitle: 'Senior Career Counselor',
                sections: 2,
                content: 'Hi MECPS students,\n\nThe syllabus lists a Suggested Event for tonight: Industry Night (RVTech). Please note the updated timing and location. I am also available for 1:1 career advising this week—book a slot via the link in the syllabus.',
                signatureLine: 'Carly Stevenson, Senior Career Counselor'
            },
            {
                id: 3,
                title: 'Midterm Exam Schedule',
                date: '3 days ago',
                postedAt: '2026-02-08T10:00:00',
                content: 'The midterm exam will be held on November 15th in our regular classroom.'
            }
        ]
    },
    2: {
        id: 2,
        code: 'MATH 2D',
        name: 'Multivariable Calculus',
        professor: 'Prof. Smith',
        color: 'from-green-500 to-green-600',
        description: 'Vector geometry, partial derivatives, multiple integrals, line and surface integrals, Green\'s theorem, Stokes\' theorem.',
        term: 'Fall 2025',
        credits: 4,
        location: 'RH 104',
        time: 'TuTh 11:00-12:20pm',
        officeHours: 'Monday 1-3pm, Wednesday 2-4pm',
        assignments: [
            {
                id: 1,
                title: 'Homework 5: Partial Derivatives',
                dueDate: 'Oct 20 at 11:59pm',
                points: 50,
                submitted: true,
                grade: 47,
                description: 'Complete problems on partial derivatives from Chapter 14. This homework covers first and second order partial derivatives, the chain rule for multivariable functions, and implicit differentiation. Show all work clearly, including intermediate steps. Use proper mathematical notation. You may use computer algebra systems to check your answers, but you must show the manual work. Submit your solutions as a PDF file.'
            },
            {
                id: 2,
                title: 'Homework 6: Chain Rule',
                dueDate: 'Oct 27 at 11:59pm',
                points: 50,
                submitted: true,
                grade: 45,
                description: 'Apply the multivariable chain rule to solve complex differentiation problems. This assignment focuses on functions of multiple variables where each variable depends on other variables. Practice both the tree diagram method and the direct substitution method. Include detailed explanations of your approach for each problem. Problems range from basic applications to more complex nested compositions. Submit as a neatly scanned PDF or typed document.'
            },
            {
                id: 3,
                title: 'Homework 7: Double Integrals',
                dueDate: 'Nov 6 at 11:59pm',
                points: 50,
                submitted: false,
                grade: null,
                description: 'Evaluate double integrals over rectangular and general regions. This homework covers setting up and evaluating iterated integrals, changing the order of integration, and finding volumes under surfaces. You will work with both Type I and Type II regions. Sketch the regions of integration for each problem. Show all steps in your evaluation. Problems include applications to finding areas, volumes, and average values. Submit a PDF with clear diagrams and work shown.'
            }
        ],
        modules: [
            { id: 1, title: 'Chapter 12: Vectors', completed: true, items: 8 },
            { id: 2, title: 'Chapter 13: Vector Functions', completed: true, items: 7 },
            { id: 3, title: 'Chapter 14: Partial Derivatives', completed: false, items: 9 },
            { id: 4, title: 'Chapter 15: Multiple Integrals', completed: false, items: 8 }
        ],
        announcements: [
            { id: 1, title: 'Office Hours Update', date: '5 hours ago', content: 'Additional office hours added on Fridays 10am-12pm.' }
        ]
    },
    3: {
        id: 3,
        code: 'WRITING 39B',
        name: 'Critical Reading & Rhetoric',
        professor: 'Prof. Johnson',
        color: 'from-orange-500 to-orange-600',
        description: 'Intensive instruction in critical reading and academic writing. Focus on analyzing complex texts and developing arguments.',
        term: 'Fall 2025',
        credits: 4,
        location: 'HIB 100',
        time: 'MWF 1:00-1:50pm',
        officeHours: 'Monday 3-5pm',
        assignments: [
            {
                id: 1,
                title: 'Essay 1: Rhetorical Analysis',
                dueDate: 'Oct 10 at 11:59pm',
                points: 100,
                submitted: true,
                grade: 92,
                description: 'Write a 4-5 page rhetorical analysis of the assigned reading. Analyze the author\'s use of rhetorical strategies including ethos, pathos, and logos. Examine the audience, purpose, and context of the piece. Your essay should have a clear thesis statement about the effectiveness of the author\'s rhetorical choices. Support your analysis with specific textual evidence and proper MLA citations. Include a Works Cited page. This essay should demonstrate your understanding of rhetorical analysis and your ability to write a well-organized academic essay.'
            },
            {
                id: 2,
                title: 'Essay Draft 2',
                dueDate: 'Nov 8 at 11:59pm',
                points: 100,
                submitted: false,
                grade: null,
                description: 'Submit a complete draft of your argument essay (5-6 pages). This essay should present a clear argumentative claim about a contemporary issue and support it with evidence from at least 4 credible sources. Your argument should acknowledge and respond to counterarguments. Use MLA format for in-text citations and Works Cited. The draft should be complete enough to receive meaningful feedback. Focus on developing a strong thesis, logical organization, effective paragraph structure, and integration of sources. This draft will be peer-reviewed in class and returned with instructor feedback.'
            },
            {
                id: 3,
                title: 'Final Research Paper',
                dueDate: 'Dec 10 at 11:59pm',
                points: 200,
                submitted: false,
                grade: null,
                description: 'Complete a 8-10 page research-based argumentative essay on a topic of your choice (approved by instructor). This paper should synthesize information from at least 6 scholarly sources to support an original argument. Your paper must include proper MLA formatting, in-text citations, and a Works Cited page. Demonstrate critical thinking by analyzing sources, not just summarizing them. Address counterarguments and show why your position is most valid. The paper should have a clear introduction with thesis, well-developed body paragraphs with topic sentences, smooth transitions, and a strong conclusion. This is your culminating assignment for the course.'
            }
        ],
        modules: [
            { id: 1, title: 'Module 1: Introduction to Rhetoric', completed: true, items: 5 },
            { id: 2, title: 'Module 2: Analyzing Arguments', completed: true, items: 6 },
            { id: 3, title: 'Module 3: Research Methods', completed: false, items: 7 }
        ],
        announcements: []
    },
    4: {
        id: 4,
        code: 'ICS 6B',
        name: 'Boolean Algebra & Logic',
        professor: 'Prof. Klefstad',
        color: 'from-purple-500 to-purple-600',
        description: 'Boolean algebra, logic gates, circuit minimization, sequential circuits, and finite automata.',
        term: 'Fall 2025',
        credits: 4,
        location: 'ICS 180',
        time: 'TuTh 2:00-3:20pm',
        officeHours: 'Wednesday 10am-12pm',
        assignments: [
            {
                id: 1,
                title: 'Problem Set 3: Logic Gates',
                dueDate: 'Oct 25 at 11:59pm',
                points: 50,
                submitted: true,
                grade: 48,
                description: 'Complete problems on logic gates and Boolean expressions. This problem set covers AND, OR, NOT, NAND, NOR, XOR, and XNOR gates. You will convert between logic expressions and circuit diagrams, create truth tables, and simplify Boolean expressions using Boolean algebra laws. Design circuits to implement given Boolean functions. Problems include both theoretical questions and practical circuit design challenges. Show all simplification steps. Submit your solutions as a PDF with clearly drawn circuit diagrams.'
            },
            {
                id: 2,
                title: 'Problem Set 4: Circuit Design',
                dueDate: 'Nov 10 at 11:59pm',
                points: 50,
                submitted: false,
                grade: null,
                description: 'Design and analyze combinational logic circuits. This assignment involves using Karnaugh maps for circuit minimization, designing circuits with multiple outputs, and implementing circuits using only NAND or NOR gates. You will also analyze existing circuits to determine their function. Create sum-of-products (SOP) and product-of-sums (POS) expressions. Each problem requires you to show the minimization process and draw the final optimized circuit. Include timing analysis where specified. Submit clear, professional circuit diagrams with all gates properly labeled.'
            }
        ],
        modules: [
            { id: 1, title: 'Boolean Algebra Fundamentals', completed: true, items: 6 },
            { id: 2, title: 'Logic Gates and Circuits', completed: false, items: 7 },
            { id: 3, title: 'Sequential Circuits', completed: false, items: 8 }
        ],
        announcements: []
    },
    5: {
        id: 5,
        code: 'PHYSICS 7C',
        name: 'Classical Mechanics',
        professor: 'Prof. Davis',
        color: 'from-red-500 to-red-600',
        description: 'Newton\'s laws, work and energy, momentum, rotational motion, oscillations, and gravitation.',
        term: 'Fall 2025',
        credits: 4,
        location: 'PSCB 140',
        time: 'MWF 12:00-12:50pm',
        officeHours: 'Thursday 1-3pm',
        assignments: [
            {
                id: 1,
                title: 'Lab Report 3: Pendulum',
                dueDate: 'Nov 1 at 11:59pm',
                points: 100,
                submitted: true,
                grade: 90,
                description: 'Complete a formal lab report on the simple pendulum experiment. Your report should include: abstract, introduction with background theory, materials and methods, results with data tables and graphs, discussion of results, error analysis, and conclusion. Calculate the acceleration due to gravity from your pendulum measurements and compare with the accepted value. Analyze sources of experimental error and their impact on your results. Include uncertainty analysis for all measurements. Graphs should be computer-generated with proper labels, units, and error bars. Follow the lab report format guidelines provided in class. Submit as a PDF.'
            },
            {
                id: 2,
                title: 'Problem Set 5: Rotational Motion',
                dueDate: 'Nov 12 at 11:59pm',
                points: 50,
                submitted: false,
                grade: null,
                description: 'Solve problems involving rotational kinematics, torque, moment of inertia, and rotational energy. This problem set covers rotating rigid bodies, angular acceleration, rotational dynamics, and conservation of angular momentum. Problems include both uniform and non-uniform rotation, as well as combined translational and rotational motion. Calculate moments of inertia for various shapes, analyze torque in equilibrium situations, and apply energy conservation to rotating systems. Show all work including free body diagrams where appropriate. Use proper units throughout. Submit clear, organized solutions as a PDF.'
            }
        ],
        modules: [
            { id: 1, title: 'Newton\'s Laws', completed: true, items: 5 },
            { id: 2, title: 'Energy and Momentum', completed: true, items: 6 },
            { id: 3, title: 'Rotational Motion', completed: false, items: 7 }
        ],
        announcements: []
    },
    6: {
        id: 6,
        code: 'HUMCORE 1A',
        name: 'Humanities Core Course',
        professor: 'Prof. Williams',
        color: 'from-teal-500 to-teal-600',
        description: 'Interdisciplinary approach to human culture through literature, art, philosophy, and history.',
        term: 'Fall 2025',
        credits: 8,
        location: 'HIB 110',
        time: 'TuTh 3:30-4:50pm',
        officeHours: 'Tuesday 1-3pm, Friday 2-4pm',
        assignments: [
            {
                id: 1,
                title: 'Reading Response 4',
                dueDate: 'Nov 3 at 11:59pm',
                points: 50,
                submitted: true,
                grade: 45,
                description: 'Write a 2-3 page reading response to this week\'s assigned texts from ancient Greek literature. Your response should demonstrate close reading and critical engagement with the texts. Address the prompts provided in the course reader. Make specific references to the texts with proper citations. Consider themes, literary techniques, historical context, and philosophical implications. Connect the readings to broader course themes about civilization, culture, and human nature. This is not a summary but an analytical response. Use MLA format. Submit as a PDF or Word document.'
            },
            {
                id: 2,
                title: 'Essay 2: Ancient Greece',
                dueDate: 'Nov 10 at 11:59pm',
                points: 100,
                submitted: false,
                grade: null,
                description: 'Write a 5-6 page analytical essay examining a central theme in ancient Greek civilization. Choose from the approved topics list: democracy and citizenship, the role of mythology, concepts of heroism, philosophy and rational thought, or artistic achievement. Your essay should analyze primary sources (literature, philosophy, art) studied in class and incorporate scholarly secondary sources. Develop an original thesis and support it with evidence. Consider historical context and lasting cultural impact. Demonstrate understanding of the interdisciplinary nature of the humanities. Use proper citations (MLA or Chicago style). Include a bibliography. Submit as PDF.'
            },
            {
                id: 3,
                title: 'Group Presentation',
                dueDate: 'Nov 17 at 11:59pm',
                points: 100,
                submitted: false,
                grade: null,
                description: 'Work with your assigned group to create and deliver a 15-20 minute multimedia presentation on your chosen aspect of ancient Roman culture. Your presentation should educate the class on your topic using a variety of sources and media (images, video clips, primary texts, etc.). Each group member must contribute equally and speak during the presentation. Submit your presentation slides and a 2-page summary of your research findings. Include a bibliography of sources consulted. The presentation will be graded on content depth, organization, creativity, delivery, and teamwork. Practice your presentation beforehand. Submit materials via Canvas before your presentation date.'
            },
            {
                id: 4,
                title: 'Final Paper',
                dueDate: 'Dec 12 at 11:59pm',
                points: 200,
                submitted: false,
                grade: null,
                description: 'Complete a substantial 10-12 page research paper on a topic connecting multiple units from the course. Your paper should demonstrate mastery of interdisciplinary humanities analysis, drawing on literature, history, philosophy, and art. Develop an original argument that synthesizes material from different time periods or cultures studied this quarter. Use at least 8 scholarly sources, including both primary and secondary materials. Your paper should show sophisticated critical thinking, clear writing, proper organization, and thorough research. Follow MLA format strictly. Include footnotes/endnotes and a Works Cited page. This is your major culminating work for the course and should represent your best academic writing.'
            }
        ],
        modules: [
            { id: 1, title: 'Ancient Civilizations', completed: true, items: 10 },
            { id: 2, title: 'Classical Greece', completed: false, items: 12 },
            { id: 3, title: 'Roman Empire', completed: false, items: 11 }
        ],
        announcements: [
            { id: 1, title: 'Guest Lecture This Week', date: '1 day ago', content: 'Dr. Sarah Chen will give a guest lecture on Greek philosophy this Thursday.' }
        ]
    }
};

/**
 * Gets course details by ID
 * @param {number} courseId - Course ID
 * @returns {object|null} Course details or null
 */
export const getCourseById = (courseId) => {
    return courseDetails[courseId] || null;
};

/**
 * Calculates current grade for a course
 * @param {object} course - Course object
 * @returns {number|null} Grade percentage or null
 */
export const calculateCurrentGrade = (course) => {
    if (!course || !course.assignments) return null;

    const gradedAssignments = course.assignments.filter(a => a.grade !== null);
    if (gradedAssignments.length === 0) return null;

    const totalPoints = gradedAssignments.reduce((sum, a) => sum + a.points, 0);
    const earnedPoints = gradedAssignments.reduce((sum, a) => sum + a.grade, 0);

    return Math.round((earnedPoints / totalPoints) * 100);
};

/**
 * Gets pending assignments for a course
 * @param {object} course - Course object
 * @returns {Array} Pending assignments
 */
export const getPendingAssignments = (course) => {
    if (!course || !course.assignments) return [];
    return course.assignments.filter(a => !a.submitted);
};

/**
 * Gets completed modules count
 * @param {object} course - Course object
 * @returns {number} Number of completed modules
 */
export const getCompletedModulesCount = (course) => {
    if (!course || !course.modules) return 0;
    return course.modules.filter(m => m.completed).length;
};
