export const BRIEFING_STUDENT_ORIENTATION_IMAGE = '/images/briefing_student_orientation.jpg';
export const INDUSTRY_MENTORSHIP_IMAGE_FILE = '/images/industry_mentorship.jpg';
export const SCHOLARSHIP_AWARDED_IMAGE_FILE = '/images/scholarship_awarded.jpg';
export const ANNUAL_GATHERING_IMAGE_FILE = '/images/annual_gathering.jpg';

export const briefingStudentOrientationImg = '/images/briefing_student_orientation.jpg';
export const industryMentorshipImg = '/images/industry_mentorship.jpg';
export const scholarshipAwardedImg = '/images/scholarship_awarded.jpg';
export const annualGatheringImg = '/images/annual_gathering.jpg';
export const galleryDrive1Img = '/images/gallery_drive_1.jpg';
export const galleryDrive2Img = '/images/gallery_drive_2.jpg';
export const galleryDrive3Img = '/images/gallery_drive_3.jpg';
export const galleryDrive4Img = '/images/gallery_drive_4.jpg';

export interface Coordinator {
  name: string;
  role: string;
  designation?: string;
  description: string;
}

export interface Service {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export interface StudentInfo {
  id: string;
  name: string;
  initials: string;
  yearBadge: string;
  course: string;
  branch: string;
  college: string;
  academicYear: string;
  applicationUrl: string;
  category: 'PUC' | 'Degree';
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  altText: string;
  imageUrl: string;
}

export const LOGO_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuD6IK-gvfWxq_V1FFrJUUf-WXSms-1ValXTGe16egK7fYqXFIQIDVgmTX9xx4TD5Rc57yDDixlgREaWjQnVBrAeFP4rUDEPXGhblvUvunfzIS2XbDaL2IJuFX3XcAq7Ba1PIPzKtHWmZ4-PmmAuZvZLqYnhjCcLjqmfQMFsSyQn_g6Dic2M5FU05GtmrLOZDEmf4XzIFt8FCrv6IegoAlBdPbhRkYSi60NQmRr9TouQAtM0OOS6yls1AwvgKJ9I9BZz5Uk";

export const HERO_IMAGE_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuCPIZI8aQpUlE0Xtns-0Dlm7LlNxW_Qmzz5mwYMubppkyoHZbqG-xC7upXe1ayvzeXRZz03Nikv9ho6TaIdLHOA2kL9ku1ZAB8ZN6umGq3YtjvtUh7GjKyEZfPcqbMKbmcSorSnDTTqsmuc1c5ThMLfTVRaqUFvqXhMyQlQhVs_WU_5Jhp8KIRJ8WSMi2LPhiD4Vdmj5JXqDbGG-LbGiNuwxI_MDcJzeVXx8o3KiilT2P8vTZySKb2fiCCIIBXcpAK-zvI";

export const FOUNDER_IMAGE_URL = HERO_IMAGE_URL;

export const LEADERSHIP_ADDRESS_IMAGE = '/images/gallery_drive_1.jpg';
export const INDUSTRY_MENTORSHIP_IMAGE = '/images/gallery_drive_2.jpg';
export const SCHOLARSHIP_AWARDED_IMAGE = '/images/gallery_drive_3.jpg';
export const ANNUAL_GATHERING_IMAGE = '/images/gallery_drive_4.jpg';

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "foundation-briefing-student-orientation",
    title: "Foundation Briefing & Student Orientation",
    category: "Orientation & Briefing",
    description: "The Founder and leadership of the Kumar Charitable Foundation conduct a comprehensive briefing session for students, orienting them on the foundation's vision, scholarship workflow, values, and career guidance.",
    altText: "Foundation leadership briefing students on foundation vision, scholarship workflow, and educational guidance.",
    imageUrl: LEADERSHIP_ADDRESS_IMAGE
  },
  {
    id: "industry-mentorship-career-guidance",
    title: "Industry Mentorship & Career Guidance",
    category: "Mentorship Program",
    description: "Experienced industry professionals conduct an interactive mentoring session with scholarship students, sharing practical industry knowledge, career guidance, and professional insights. These sessions help students develop confidence, improve employability, and prepare for future career opportunities.",
    altText: "Industry professionals mentoring scholarship students during an interactive career guidance session.",
    imageUrl: INDUSTRY_MENTORSHIP_IMAGE
  },
  {
    id: "scholarship-awarded-student",
    title: "Scholarship Awarded to Student",
    category: "Scholarship Distribution",
    description: "A deserving student receives a scholarship from the Kumar Charitable Foundation, marking an important milestone in her educational journey. Through financial assistance, the Foundation is committed to ensuring that talented students can pursue higher education without financial barriers and continue working towards their dreams.",
    altText: "Student receiving a scholarship from Kumar Charitable Foundation .",
    imageUrl: SCHOLARSHIP_AWARDED_IMAGE
  },
  {
    id: "annual-gathering",
    title: "Annual Student Gathering & Scholarship Awarding",
    category: "Annual Events",
    description: "Foundation leadership and coordinators pictured with supported scholars during the annual scholarship gathering.",
    altText: "Kumar Charitable Foundation group photograph with students and coordinators",
    imageUrl: ANNUAL_GATHERING_IMAGE
  }
];

export const COORDINATORS: Coordinator[] = [
  {
    name: "Mr. Basavaraju",
    designation: "Ex - Assistant Commissioner",
    role: "Coordinator",
    description: "As Ex - Assistant Commissioner, Mr. Basavaraju oversees the fair and systematic distribution of scholarships. His vast administrative experience ensures the Foundation operates smoothly and reaches those who need it most."
  },
  {
    name: "Mrs. Manasa B. V.",
    role: "Coordinator",
    description: "Mrs. Manasa, a Teacher, plays a pivotal role in identifying eligible students based on three core criteria: Academic Merit, Ambition, and Financial Need. Her dedication ensures that the right candidates are selected."
  },
  {
    name: "Mr. Praveen",
    role: "Coordinator",
    description: "Mr. Praveen, who handles Banking & Records, manages banking operations, documentation, and record-keeping. His meticulous attention to detail ensures the Foundation maintains high standards of accountability and transparency."
  }
];

export const SERVICES: Service[] = [
  {
    id: "scholarship",
    title: "Scholarship Programme",
    icon: "school",
    description: "We provide educational scholarships to deserving students who have demonstrated academic excellence and financial need. Students are selected based on three core values: Merit, Ambition, and Financial Need, ensuring equal opportunities for talented students to pursue higher education."
  },
  {
    id: "support",
    title: "Student Support",
    icon: "volunteer_activism",
    description: "Beyond financial assistance, the Foundation provides continuous academic support, personal encouragement, and guidance to help students overcome challenges throughout their educational journey. We strive to create an environment where every student feels supported, valued, and empowered to achieve their goals."
  },
  {
    id: "guidance",
    title: "Career Development",
    icon: "work",
    description: "The Foundation organizes career guidance sessions that help students understand higher education opportunities, career pathways, industry expectations, and future employment prospects. Experienced professionals share practical insights to help students make informed academic and career decisions."
  },
  {
    id: "mentorship",
    title: "Mentorship & Guidance",
    icon: "group",
    description: "Experienced mentors provide continuous motivation, leadership development, and personal guidance to scholarship students. Through regular mentoring sessions, students gain confidence, develop essential life skills, and receive valuable advice that prepares them for academic success and professional growth."
  }
];

export const STUDENT_LIST: StudentInfo[] = [
  {
    id: "student-1",
    name: "Sadiya Kousar",
    initials: "SK",
    yearBadge: "1ST YEAR",
    course: "B.E.",
    branch: "Electronics and Communication Engineering (ECE)",
    college: "Jyothi Institute of Technology",
    academicYear: "1st Year",
    applicationUrl: "https://drive.google.com/drive/folders/1YUI-34bioh0QdesMSUFUfiWvES9rDenO",
    category: "Degree"
  },
  {
    id: "student-2",
    name: "Ananya J",
    initials: "AJ",
    yearBadge: "1ST YEAR",
    course: "B.E.",
    branch: "Computer Science and Engineering (CSE)",
    college: "Jyothi Institute of Technology",
    academicYear: "1st Year",
    applicationUrl: "https://drive.google.com/drive/folders/1YUI-34bioh0QdesMSUFUfiWvES9rDenO",
    category: "Degree"
  },
  {
    id: "student-3",
    name: "K. Yashaswini",
    initials: "KY",
    yearBadge: "1ST YEAR",
    course: "B.E.",
    branch: "Electronics and Communication Engineering (ECE)",
    college: "Jyothi Institute of Technology",
    academicYear: "1st Year",
    applicationUrl: "https://drive.google.com/drive/folders/1YUI-34bioh0QdesMSUFUfiWvES9rDenO",
    category: "Degree"
  },
  {
    id: "student-4",
    name: "Dhananjaya R.",
    initials: "DR",
    yearBadge: "1ST YEAR",
    course: "B.E.",
    branch: "Electronics and Communication Engineering (ECE)",
    college: "Government Engineering College, Ramanagara",
    academicYear: "1st Year",
    applicationUrl: "https://drive.google.com/drive/folders/1YUI-34bioh0QdesMSUFUfiWvES9rDenO",
    category: "Degree"
  },
  {
    id: "student-5",
    name: "Jyothi",
    initials: "J",
    yearBadge: "1ST YEAR",
    course: "B.E.",
    branch: "Computer Science and Engineering (CSE)",
    college: "Government Engineering College, Mandya",
    academicYear: "1st Year",
    applicationUrl: "https://drive.google.com/drive/folders/1YUI-34bioh0QdesMSUFUfiWvES9rDenO",
    category: "Degree"
  },
  {
    id: "student-ramya",
    name: "Ramya",
    initials: "R",
    yearBadge: "2ND PUC",
    course: "PUC",
    branch: "PCMB",
    college: "Vijaya College",
    academicYear: "2nd Year",
    applicationUrl: "https://drive.google.com/drive/folders/1QBBMS-xK67Ha0ziek06jG52S8blL4zXg?usp=sharing",
    category: "PUC"
  },
  {
    id: "student-thanushree",
    name: "Thanushree",
    initials: "T",
    yearBadge: "2ND PUC",
    course: "PUC",
    branch: "PCMB",
    college: "Vijaya College",
    academicYear: "2nd Year",
    applicationUrl: "https://drive.google.com/drive/folders/1QBBMS-xK67Ha0ziek06jG52S8blL4zXg?usp=sharing",
    category: "PUC"
  },
  {
    id: "student-gangamma",
    name: "Gangamma",
    initials: "G",
    yearBadge: "2ND PUC",
    course: "PUC",
    branch: "PCMB",
    college: "Vijaya College",
    academicYear: "2nd Year",
    applicationUrl: "https://drive.google.com/drive/folders/1QBBMS-xK67Ha0ziek06jG52S8blL4zXg?usp=sharing",
    category: "PUC"
  },
  {
    id: "student-yashwanth",
    name: "Yashwanth",
    initials: "Y",
    yearBadge: "2ND PUC",
    course: "PUC",
    branch: "ECBA",
    college: "VET College",
    academicYear: "2nd Year",
    applicationUrl: "https://drive.google.com/drive/folders/1QBBMS-xK67Ha0ziek06jG52S8blL4zXg?usp=sharing",
    category: "PUC"
  },
  {
    id: "student-harsha",
    name: "Harsha",
    initials: "H",
    yearBadge: "2ND PUC",
    course: "PUC",
    branch: "ECBA",
    college: "VET College",
    academicYear: "2nd Year",
    applicationUrl: "https://drive.google.com/drive/folders/1QBBMS-xK67Ha0ziek06jG52S8blL4zXg?usp=sharing",
    category: "PUC"
  },
  {
    id: "student-chinmayi",
    name: "Chinmayi",
    initials: "C",
    yearBadge: "2ND PUC",
    course: "PUC",
    branch: "ECBA",
    college: "Columbia College",
    academicYear: "2nd Year",
    applicationUrl: "https://drive.google.com/drive/folders/1QBBMS-xK67Ha0ziek06jG52S8blL4zXg?usp=sharing",
    category: "PUC"
  },
  {
    id: "student-shukla",
    name: "Shukla",
    initials: "S",
    yearBadge: "1ST PUC",
    course: "PUC",
    branch: "PCMB",
    college: "Vijaya College",
    academicYear: "1st Year",
    applicationUrl: "https://drive.google.com/drive/folders/1AJmT92TOGwknYYKIjl0eueIwYGKnN4bu?usp=sharing",
    category: "PUC"
  },
  {
    id: "student-hemalatha",
    name: "Hemalatha",
    initials: "H",
    yearBadge: "1ST PUC",
    course: "PUC",
    branch: "PCMB",
    college: "BES PU College",
    academicYear: "1st Year",
    applicationUrl: "https://drive.google.com/drive/folders/1AJmT92TOGwknYYKIjl0eueIwYGKnN4bu?usp=sharing",
    category: "PUC"
  },
  {
    id: "student-trushik",
    name: "Trushik",
    initials: "T",
    yearBadge: "1ST BHM",
    course: "BHM",
    branch: "Hotel Management",
    college: "Chennias Amrita HM College",
    academicYear: "1st Year",
    applicationUrl: "https://drive.google.com/drive/folders/1YUI-34bioh0QdesMSUFUfiWvES9rDenO",
    category: "Degree"
  }
];
