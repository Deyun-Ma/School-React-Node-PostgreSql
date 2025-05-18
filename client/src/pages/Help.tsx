import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  HelpCircle,
  Mail,
  FileText,
  PhoneCall,
  CheckCircle,
  VideoIcon,
  BookOpen,
  GraduationCap,
  CalendarCheck,
  BarChart3,
  Users,
} from "lucide-react";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would filter through help articles or FAQs
    toast({
      title: "Search Results",
      description: `Showing results for "${searchQuery}"`,
    });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would send the contact form data
    toast({
      title: "Support Request Sent",
      description: "We'll get back to you as soon as possible.",
      variant: "default",
    });
    setContactForm({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  // Sample user guides
  const userGuides = [
    {
      title: "Dashboard Overview",
      icon: <BookOpen className="h-5 w-5" />,
      description: "Learn how to navigate and interpret the main dashboard metrics.",
      link: "#dashboard-guide",
    },
    {
      title: "Student Management",
      icon: <Users className="h-5 w-5" />,
      description: "Managing student profiles, enrollments, and academic records.",
      link: "#students-guide",
    },
    {
      title: "Teacher Management",
      icon: <GraduationCap className="h-5 w-5" />,
      description: "Adding teachers, assigning classes, and managing schedules.",
      link: "#teachers-guide",
    },
    {
      title: "Attendance Tracking",
      icon: <CalendarCheck className="h-5 w-5" />,
      description: "Recording and monitoring student attendance.",
      link: "#attendance-guide",
    },
    {
      title: "Grading System",
      icon: <BarChart3 className="h-5 w-5" />,
      description: "Understanding the grading system and generating report cards.",
      link: "#grades-guide",
    },
  ];

  // Video tutorials
  const videoTutorials = [
    {
      title: "Getting Started with SchoolSync",
      duration: "5:30",
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=170&q=80",
    },
    {
      title: "Managing Student Records",
      duration: "7:15",
      thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=170&q=80",
    },
    {
      title: "Attendance and Grading System",
      duration: "9:45",
      thumbnail: "https://images.unsplash.com/photo-1581093069385-f50d7e3aee08?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=170&q=80",
    },
  ];

  return (
    <div className="container py-6 space-y-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-500 max-w-3xl">
          Get help with SchoolSync features, find answers to common questions, access user guides, 
          or reach out to our support team.
        </p>

        <form onSubmit={handleSearch} className="flex space-x-2 max-w-md">
          <Input
            type="text"
            placeholder="Search for help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Search</Button>
        </form>
      </div>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="faq">
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQs
          </TabsTrigger>
          <TabsTrigger value="guides">
            <FileText className="h-4 w-4 mr-2" />
            User Guides
          </TabsTrigger>
          <TabsTrigger value="videos">
            <VideoIcon className="h-4 w-4 mr-2" />
            Video Tutorials
          </TabsTrigger>
          <TabsTrigger value="contact">
            <Mail className="h-4 w-4 mr-2" />
            Contact Support
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find answers to common questions about SchoolSync.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="faq-1">
                  <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                  <AccordionContent>
                    To reset your password, click on "Forgot Password" on the login screen. Enter your email address, 
                    and we'll send you instructions to create a new password. If you still can't access your account, 
                    please contact your school administrator.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-2">
                  <AccordionTrigger>How can I add a new student to the system?</AccordionTrigger>
                  <AccordionContent>
                    Navigate to the Students page and click the "Add Student" button. Fill in the required information 
                    in the form, including their personal details, contact information, and class assignment. Click 
                    "Save" to add the student to the system.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-3">
                  <AccordionTrigger>Can I export attendance records?</AccordionTrigger>
                  <AccordionContent>
                    Yes, you can export attendance records as CSV or PDF files. On the Attendance page, use the filter 
                    options to select the date range and class. Then click the "Export" button and choose your preferred 
                    format.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-4">
                  <AccordionTrigger>How do I create a new class?</AccordionTrigger>
                  <AccordionContent>
                    Go to the Classes page and click "Add Class." Enter the class details including name, grade level, 
                    section, assigned teacher, and schedule. After saving, you can add students to this class from the 
                    class details page.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-5">
                  <AccordionTrigger>How does the grading system work?</AccordionTrigger>
                  <AccordionContent>
                    Our grading system allows you to record different types of assessments (exams, quizzes, homework, 
                    projects) with custom weightings. When adding grades, specify the assignment type, maximum score, 
                    and actual score. The system automatically calculates averages and final grades based on your 
                    school's grading policy.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-6">
                  <AccordionTrigger>Can I generate report cards automatically?</AccordionTrigger>
                  <AccordionContent>
                    Yes, report cards can be generated from the Grades page. Select the class, grading period, and 
                    students, then click "Generate Report Cards." The system compiles all grades and attendance data 
                    into a professional report that can be printed or emailed to parents.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-7">
                  <AccordionTrigger>How do I mark attendance for a class?</AccordionTrigger>
                  <AccordionContent>
                    On the Attendance page, select the class and date. You'll see a list of all students in that class. 
                    Mark each student as present, absent, late, or excused using the status dropdown, and add notes if needed. 
                    Click "Save Attendance" when finished.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guides" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userGuides.map((guide, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="bg-blue-50 pb-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-100 rounded-full">
                      {guide.icon}
                    </div>
                    <CardTitle className="text-xl">{guide.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-gray-600 mb-4">{guide.description}</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={guide.link}>View Guide</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Tips & Shortcuts</CardTitle>
              <CardDescription>
                Helpful shortcuts to improve your productivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Bulk Actions</h4>
                    <p className="text-sm text-gray-600">Use checkboxes to select multiple items for batch operations like attendance marking or grade entry.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Advanced Filtering</h4>
                    <p className="text-sm text-gray-600">Click the funnel icon in any table to access advanced filtering options.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Quick Search</h4>
                    <p className="text-sm text-gray-600">Press <kbd className="px-1 py-0.5 bg-gray-100 border rounded text-xs">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-gray-100 border rounded text-xs">K</kbd> to open the global search from anywhere.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Data Export</h4>
                    <p className="text-sm text-gray-600">Look for the export icon to download data as CSV, Excel, or PDF formats.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {videoTutorials.map((video, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-40 object-cover" 
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                      <VideoIcon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-medium text-lg mb-2">{video.title}</h3>
                  <Button variant="outline" size="sm" className="w-full">
                    Watch Video
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Video Playlists</CardTitle>
              <CardDescription>
                Organized collections of tutorial videos by topic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-2">Getting Started Series</h3>
                    <p className="text-sm text-gray-600 mb-3">5 videos to help new users get up and running with SchoolSync</p>
                    <ul className="space-y-2">
                      <li className="flex justify-between items-center text-sm">
                        <span className="flex items-center">
                          <VideoIcon className="h-4 w-4 mr-2 text-gray-500" />
                          Introduction to SchoolSync
                        </span>
                        <span className="text-gray-500">3:45</span>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span className="flex items-center">
                          <VideoIcon className="h-4 w-4 mr-2 text-gray-500" />
                          Setting Up Your Profile
                        </span>
                        <span className="text-gray-500">4:20</span>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span className="flex items-center">
                          <VideoIcon className="h-4 w-4 mr-2 text-gray-500" />
                          Navigating the Dashboard
                        </span>
                        <span className="text-gray-500">5:10</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-2">Advanced Features</h3>
                    <p className="text-sm text-gray-600 mb-3">7 videos covering the powerful advanced features</p>
                    <ul className="space-y-2">
                      <li className="flex justify-between items-center text-sm">
                        <span className="flex items-center">
                          <VideoIcon className="h-4 w-4 mr-2 text-gray-500" />
                          Custom Report Creation
                        </span>
                        <span className="text-gray-500">8:15</span>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span className="flex items-center">
                          <VideoIcon className="h-4 w-4 mr-2 text-gray-500" />
                          Data Analytics Dashboard
                        </span>
                        <span className="text-gray-500">7:30</span>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span className="flex items-center">
                          <VideoIcon className="h-4 w-4 mr-2 text-gray-500" />
                          Integrating External Tools
                        </span>
                        <span className="text-gray-500">9:45</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Email Support</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">For general inquiries and non-urgent issues</p>
                <p className="font-medium text-primary">support@schoolsync.edu</p>
                <p className="text-sm text-gray-500 mt-2">Response within 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <PhoneCall className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Phone Support</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">For urgent technical issues requiring immediate assistance</p>
                <p className="font-medium text-primary">+1 (555) 123-4567</p>
                <p className="text-sm text-gray-500 mt-2">Mon-Fri, 8am-6pm EST</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <HelpCircle className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Live Chat</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">For quick questions and guided troubleshooting</p>
                <Button variant="outline">Start Chat</Button>
                <p className="text-sm text-gray-500 mt-2">Available during business hours</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Contact Support Team</CardTitle>
              <CardDescription>
                Fill out this form to get help with more complex issues or provide feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Your Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={contactForm.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={contactForm.email}
                      onChange={handleInputChange}
                      placeholder="john.doe@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleInputChange}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={contactForm.message}
                    onChange={handleInputChange}
                    placeholder="Please provide details about your issue or question..."
                    rows={5}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Submit Request</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Help;