import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Upload, Briefcase, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import emailjs from '@emailjs/browser';

// Initialize EmailJS with the Public Key from environment variables
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
if (PUBLIC_KEY) {
  emailjs.init(PUBLIC_KEY);
}

const jobCategories = [
  "Front Office",
  "Food & Beverage",
  "Housekeeping",
  "Kitchen",
  "Engineering & Maintenance",
  "Spa & Wellness",
  "Sales & Marketing",
  "Finance",
  "Human Resources",
  "IT",
  "Security",
  "Other"
];

const locations = [
  "Protels Crystal Beach Resort – Marsa Alam",
  "Protels Beach Club & Spa – Marsa Alam",
  "Protels La Plage – Zanzibar",
  "Protels Royal Bay Resort & Spa – Hurghada"
];

const experienceLevels = [
  "Entry Level (0-1 years)",
  "Junior (1-3 years)",
  "Mid-Level (3-5 years)",
  "Senior (5-10 years)",
  "Executive (10+ years)"
];

export default function Careers() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    location: "",
    experience: "",
    message: "",
    cv: null as File | null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, cv: e.target.files![0] }));
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.phone || !formData.position || !formData.department || !formData.location || !formData.cv) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and upload your CV.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare data for EmailJS
      let cvBase64 = null;
      if (formData.cv) {
        cvBase64 = await convertToBase64(formData.cv);
      }

      const templateParams = {
        to_name: "Protels HR Team",
        from_name: formData.fullName,
        from_email: formData.email,
        phone: formData.phone,
        position: formData.position,
        department: formData.department,
        location: formData.location,
        experience: formData.experience,
        message: formData.message || "No cover message provided.",
        file: cvBase64, 
        file_name: formData.cv?.name
      };

      const SERVICE_ID = "service_38p8y24";
      const TEMPLATE_ID = "template_gmryc8";
      
      if (!PUBLIC_KEY) {
        throw new Error("EmailJS Public Key is missing. Please check your environment configuration.");
      }

      // We pass the public key explicitly to send as well, ensuring it's used
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);

      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (error: any) {
      console.error("EmailJS Error:", error);
      toast({
        title: "Submission Failed",
        description: `There was an error sending your application: ${error?.text || error.message || "Unknown error"}. Please try again later.`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-primary/90 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-6">Join Our Team</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90 font-light leading-relaxed">
            At Protels Hotels & Resorts, we believe that exceptional hospitality starts with exceptional people.
            We are always looking for passionate, talented individuals who are eager to grow and deliver memorable guest experiences across our destinations.
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12 flex-grow">
        {isSuccess ? (
          <Card className="max-w-2xl mx-auto border-none shadow-lg">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-playfair font-bold text-gray-900 mb-4">Application Received</h2>
              <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
                Thank you for applying to Protels Hotels & Resorts.
                Our HR team will review your application, and we will contact you if your profile matches our current needs.
              </p>
              <Button onClick={() => setIsSuccess(false)} variant="outline" className="min-w-[150px]">
                Return to Careers
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar - Departments */}
            <div className="lg:col-span-1">
              <Card className="border-none shadow-md sticky top-24">
                <CardHeader className="bg-primary/5 pb-4">
                  <CardTitle className="font-playfair text-xl">Departments</CardTitle>
                  <CardDescription>Explore opportunities across our teams</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    {jobCategories.map((category) => (
                      <div key={category} className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors cursor-pointer text-sm text-gray-700">
                        <div className="w-2 h-2 rounded-full bg-primary/40 mr-3"></div>
                        {category}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Form */}
            <div className="lg:col-span-2">
              <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader className="border-b border-gray-100 bg-white">
                  <div className="flex items-center gap-3 text-primary mb-2">
                    <Briefcase className="w-5 h-5" />
                    <span className="text-sm font-medium uppercase tracking-wider">Job Application</span>
                  </div>
                  <CardTitle className="font-playfair text-3xl">Apply Now</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Please complete the form below to submit your application to our HR department.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 md:p-8 bg-white">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Section: Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center">
                        <Users className="w-4 h-4 mr-2" /> Personal Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></Label>
                          <Input 
                            id="fullName" 
                            name="fullName" 
                            placeholder="e.g. John Doe" 
                            value={formData.fullName} 
                            onChange={handleInputChange} 
                            required
                            className="bg-gray-50 focus:bg-white transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></Label>
                          <Input 
                            id="phone" 
                            name="phone" 
                            placeholder="+1 (555) 000-0000" 
                            value={formData.phone} 
                            onChange={handleInputChange} 
                            required
                            type="tel"
                            className="bg-gray-50 focus:bg-white transition-colors"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address <span className="text-red-500">*</span></Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          placeholder="john.doe@example.com" 
                          value={formData.email} 
                          onChange={handleInputChange} 
                          required
                          className="bg-gray-50 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    {/* Section: Job Details */}
                    <div className="space-y-4 pt-4">
                      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center">
                        <Briefcase className="w-4 h-4 mr-2" /> Job Details
                      </h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="position" className="text-sm font-medium text-gray-700">Position Applied For <span className="text-red-500">*</span></Label>
                        <Input 
                          id="position" 
                          name="position" 
                          placeholder="e.g. Front Desk Agent" 
                          value={formData.position} 
                          onChange={handleInputChange} 
                          required
                          className="bg-gray-50 focus:bg-white transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Preferred Department <span className="text-red-500">*</span></Label>
                          <Select onValueChange={(val) => handleSelectChange("department", val)}>
                            <SelectTrigger className="bg-gray-50 focus:bg-white transition-colors">
                              <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent>
                              {jobCategories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Years of Experience</Label>
                          <Select onValueChange={(val) => handleSelectChange("experience", val)}>
                            <SelectTrigger className="bg-gray-50 focus:bg-white transition-colors">
                              <SelectValue placeholder="Select Experience Level" />
                            </SelectTrigger>
                            <SelectContent>
                              {experienceLevels.map(level => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Preferred Hotel / Location <span className="text-red-500">*</span></Label>
                        <Select onValueChange={(val) => handleSelectChange("location", val)}>
                          <SelectTrigger className="bg-gray-50 focus:bg-white transition-colors">
                            <SelectValue placeholder="Select Location" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map(loc => (
                              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-medium text-gray-700">Cover Message</Label>
                        <Textarea 
                          id="message" 
                          name="message" 
                          placeholder="Tell us why you are a great fit for this role..." 
                          value={formData.message} 
                          onChange={handleInputChange} 
                          className="bg-gray-50 focus:bg-white transition-colors min-h-[100px]"
                        />
                      </div>
                    </div>

                    {/* Section: Attachments */}
                    <div className="space-y-4 pt-4">
                      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center">
                        <Upload className="w-4 h-4 mr-2" /> Attachments
                      </h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cv" className="text-sm font-medium text-gray-700">Upload CV (PDF, DOC, DOCX) <span className="text-red-500">*</span></Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center cursor-pointer relative">
                          <Input 
                            id="cv" 
                            name="cv" 
                            type="file" 
                            accept=".pdf,.doc,.docx" 
                            onChange={handleFileChange} 
                            required
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="flex flex-col items-center pointer-events-none">
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600 font-medium">
                              {formData.cv ? formData.cv.name : "Click to upload or drag and drop"}
                            </span>
                            <span className="text-xs text-gray-400 mt-1">Max file size: 5MB</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <Button type="submit" className="w-full md:w-auto md:min-w-[200px] h-12 text-lg" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting Application..." : "Submit Application"}
                      </Button>
                      <p className="text-xs text-gray-500 mt-4 text-center md:text-left">
                        By submitting this form, you agree to our privacy policy and allow Protels Hotels & Resorts to contact you regarding employment opportunities.
                      </p>
                    </div>

                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}