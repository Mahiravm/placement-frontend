import { useState, useRef } from "react";
import "./PlacementRegistration.css";

const steps = [
  { id: 1, label: "Academic Info", icon: "🎓" },
  { id: 2, label: "Personal Info", icon: "👤" },
  { id: 3, label: "Family Info", icon: "🏠" },
  { id: 4, label: "Documents", icon: "📄" },
];

const departments = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication",
  "Electrical & Electronics",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biomedical Engineering",
];

const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
// Update genders to match backend enum values (uppercase)
const genders = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"];

// Optional: Display labels for gender (if you want to show user-friendly text)
const genderDisplayLabels = {
  "MALE": "Male",
  "FEMALE": "Female",
  "OTHER": "Other",
  "PREFER_NOT_TO_SAY": "Prefer not to say"
};

// Map frontend year strings to backend enum values
const yearMapping = {
  "1st Year": "FIRST_YEAR",
  "2nd Year": "SECOND_YEAR",
  "3rd Year": "THIRD_YEAR",
  "4th Year": "FOURTH_YEAR"
};

// Map frontend department strings to backend enum values
const departmentMapping = {
  "Computer Science & Engineering": "CSE",
  "Information Technology": "IT",
  "Electronics & Communication": "ECE",
  "Electrical & Electronics": "EEE",
  "Mechanical Engineering": "MECH",
  "Civil Engineering": "CIVIL",
  "Chemical Engineering": "CHEM",
  "Biomedical Engineering": "BME"
};

// API base URL - adjust based on your backend port
const API_BASE_URL = "http://localhost:8080/api/students";

export default function PlacementRegistration() {
  const [step, setStep] = useState(1);
  const [profilePreview, setProfilePreview] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeName, setResumeName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });
  const [registrationId, setRegistrationId] = useState(null);
  
  const profileRef = useRef();
  const resumeRef = useRef();

  const [form, setForm] = useState({
    registerNumber: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    department: "",
    year: "",
    gender: "",
    dob: "",
    native: "",
    cgpa: "",
    historyOfArrears: "",
    fatherName: "",
    motherName: "",
    fatherOccupation: "",
    motherOccupation: "",
    familyIncome: "",
    parentPhone: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
    // Clear submit status when user starts editing
    setSubmitStatus({ type: "", message: "" });
  };

  const handleProfilePic = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profile: "File size should be less than 2MB" }));
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profile: "Please upload an image file" }));
        return;
      }
      
      setProfileFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePreview(reader.result);
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, profile: "" }));
    }
  };

  const handleResume = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, resume: "File size should be less than 5MB" }));
        return;
      }
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, resume: "Please upload PDF or DOC/DOCX file" }));
        return;
      }
      
      setResumeFile(file);
      setResumeName(file.name);
      setErrors(prev => ({ ...prev, resume: "" }));
    }
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!form.registerNumber) newErrors.registerNumber = "Required";
      if (!form.firstName) newErrors.firstName = "Required";
      if (!form.lastName) newErrors.lastName = "Required";
      if (!form.phone || !/^\d{10}$/.test(form.phone))
        newErrors.phone = "Enter valid 10-digit number";
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
        newErrors.email = "Enter valid email";
      if (!form.department) newErrors.department = "Required";
      if (!form.year) newErrors.year = "Required";
    } else if (step === 2) {
      if (!form.gender) newErrors.gender = "Required";
      if (!form.dob) newErrors.dob = "Required";
      if (!form.native) newErrors.native = "Required";
      if (!form.cgpa || isNaN(form.cgpa) || form.cgpa < 0 || form.cgpa > 10)
        newErrors.cgpa = "Enter CGPA between 0-10";
      if (form.historyOfArrears === "") newErrors.historyOfArrears = "Required";
    } else if (step === 3) {
      if (!form.fatherName) newErrors.fatherName = "Required";
      if (!form.motherName) newErrors.motherName = "Required";
      if (!form.fatherOccupation) newErrors.fatherOccupation = "Required";
      if (!form.motherOccupation) newErrors.motherOccupation = "Required";
      if (!form.familyIncome) newErrors.familyIncome = "Required";
      if (!form.parentPhone || !/^\d{10}$/.test(form.parentPhone))
        newErrors.parentPhone = "Enter valid 10-digit number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => { 
    if (validateStep()) setStep((s) => Math.min(s + 1, 4)); 
  };
  
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // Submit registration data (Steps 1-3)
  const submitRegistrationData = async () => {
    try {
      // Prepare data for backend
      const registrationData = {
        registerNumber: form.registerNumber,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email,
        department: departmentMapping[form.department] || form.department,
        year: yearMapping[form.year] || form.year,
        gender: form.gender, // This is now uppercase (MALE, FEMALE, etc.)
        dob: form.dob,
        nativePlace: form.native,
        cgpa: parseFloat(form.cgpa),
        historyOfArrears: parseInt(form.historyOfArrears) || 0,
        fatherName: form.fatherName,
        motherName: form.motherName,
        fatherOccupation: form.fatherOccupation,
        motherOccupation: form.motherOccupation,
        familyIncome: parseFloat(form.familyIncome),
        parentPhone: form.parentPhone
      };

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit registration');
      }

      // Get the ID from the response or fetch the latest registration
      const getResponse = await fetch(`${API_BASE_URL}`);
      const allRegistrations = await getResponse.json();
      const latestRegistration = allRegistrations[allRegistrations.length - 1];
      
      return latestRegistration?.id;
    } catch (error) {
      console.error('Error submitting registration:', error);
      throw error;
    }
  };

  // Upload profile picture
  const uploadProfilePicture = async (id) => {
    if (!profileFile) return;
    
    try {
      const formData = new FormData();
      formData.append('file', profileFile);
      
      const response = await fetch(`${API_BASE_URL}/${id}/profile-picture`, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to upload profile picture');
      }
      
      return result.url;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  };

  // Upload resume
  const uploadResume = async (id) => {
    if (!resumeFile) return;
    
    try {
      const formData = new FormData();
      formData.append('file', resumeFile);
      
      const response = await fetch(`${API_BASE_URL}/${id}/resume`, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to upload resume');
      }
      
      return result.url;
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) {
      return;
    }
    
    // Validate that resume is uploaded
    if (!resumeFile) {
      setErrors(prev => ({ ...prev, resume: "Please upload your resume" }));
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus({ type: "info", message: "Submitting registration..." });
    
    try {
      // Step 1: Submit registration data
      const id = await submitRegistrationData();
      setRegistrationId(id);
      
      if (!id) {
        throw new Error("Could not get registration ID");
      }
      
      setSubmitStatus({ type: "info", message: "Registration data saved. Uploading files..." });
      
      // Step 2: Upload profile picture (if provided)
      if (profileFile) {
        await uploadProfilePicture(id);
        setSubmitStatus({ type: "info", message: "Profile picture uploaded. Uploading resume..." });
      }
      
      // Step 3: Upload resume
      await uploadResume(id);
      
      setSubmitStatus({ type: "success", message: "🎉 Registration submitted successfully! You can now close this window." });
      
      // Reset form after successful submission
      setTimeout(() => {
        setSubmitStatus({ type: "", message: "" });
      }, 5000);
      
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus({ type: "error", message: `❌ Registration failed: ${error.message}. Please try again.` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ic = (field) => `pr-input${errors[field] ? " pr-input--error" : ""}`;
  const sc = (field) => `pr-select${errors[field] ? " pr-select--error" : ""}`;

  const stepCircleClass = (id) => {
    if (step > id) return "pr-step-circle pr-step-circle--done";
    if (step === id) return "pr-step-circle pr-step-circle--active";
    return "pr-step-circle pr-step-circle--inactive";
  };

  const dotClass = (id) => {
    if (step === id) return "pr-dot pr-dot--active";
    if (step > id) return "pr-dot pr-dot--done";
    return "pr-dot pr-dot--inactive";
  };

  return (
    <div className="pr-page">
      <div className="pr-container">

        {/* Header */}
        <div className="pr-header">
          <div className="pr-portal-badge">
            <span className="pr-portal-badge-icon">🎓</span>
            <span className="pr-portal-badge-text">Placement Portal</span>
          </div>
          <h1 className="pr-title">Student Registration</h1>
          <p className="pr-subtitle">Fill in your details to register for campus placements</p>
        </div>

        {/* Stepper */}
        <div className="pr-stepper">
          {steps.map((s, i) => (
            <div key={s.id} className="pr-step-item">
              <div className="pr-step-info">
                <div className={stepCircleClass(s.id)}>
                  {step > s.id ? "✓" : s.icon}
                </div>
                <span className={`pr-step-label${step === s.id ? " pr-step-label--active" : ""}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`pr-step-connector${step > s.id ? " pr-step-connector--done" : ""}`} />
              )}
            </div>
          ))}
        </div>

        {/* Status Message */}
        {submitStatus.message && (
          <div className={`pr-status-message pr-status-message--${submitStatus.type}`}>
            {submitStatus.message}
          </div>
        )}

        {/* Card */}
        <div className="pr-card">

          {/* Card Header */}
          <div className="pr-card-header">
            <span className="pr-card-header-icon">{steps[step - 1].icon}</span>
            <div>
              <div className="pr-card-header-title">{steps[step - 1].label}</div>
              <div className="pr-card-header-sub">Step {step} of {steps.length}</div>
            </div>
            <div className="pr-card-header-pct">
              {Math.round((step / steps.length) * 100)}% Complete
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pr-progress-track">
            <div className="pr-progress-fill" style={{ width: `${(step / steps.length) * 100}%` }} />
          </div>

          {/* Form */}
          <form className="pr-form" onSubmit={handleSubmit} key={step}>

            {/* STEP 1: Academic Info */}
            {step === 1 && (
              <div className="pr-field-group">
                <div className="pr-field">
                  <label className="pr-label">Register Number *</label>
                  <input name="registerNumber" value={form.registerNumber} onChange={handleChange}
                    placeholder="e.g. 21CS001" className={ic("registerNumber")} />
                  {errors.registerNumber && <p className="pr-error">{errors.registerNumber}</p>}
                </div>

                <div className="pr-grid-2">
                  <div className="pr-field">
                    <label className="pr-label">First Name *</label>
                    <input name="firstName" value={form.firstName} onChange={handleChange}
                      placeholder="First name" className={ic("firstName")} />
                    {errors.firstName && <p className="pr-error">{errors.firstName}</p>}
                  </div>
                  <div className="pr-field">
                    <label className="pr-label">Last Name *</label>
                    <input name="lastName" value={form.lastName} onChange={handleChange}
                      placeholder="Last name" className={ic("lastName")} />
                    {errors.lastName && <p className="pr-error">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="pr-grid-2">
                  <div className="pr-field">
                    <label className="pr-label">Phone Number *</label>
                    <input name="phone" value={form.phone} onChange={handleChange}
                      placeholder="10-digit mobile" maxLength={10} className={ic("phone")} />
                    {errors.phone && <p className="pr-error">{errors.phone}</p>}
                  </div>
                  <div className="pr-field">
                    <label className="pr-label">Email ID *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange}
                      placeholder="student@college.edu" className={ic("email")} />
                    {errors.email && <p className="pr-error">{errors.email}</p>}
                  </div>
                </div>

                <div className="pr-grid-2">
                  <div className="pr-field">
                    <label className="pr-label">Department *</label>
                    <div className="pr-select-wrap">
                      <select name="department" value={form.department} onChange={handleChange}
                        className={sc("department")}>
                        <option value="">Select Department</option>
                        {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <span className="pr-select-arrow">▾</span>
                    </div>
                    {errors.department && <p className="pr-error">{errors.department}</p>}
                  </div>
                  <div className="pr-field">
                    <label className="pr-label">Year *</label>
                    <div className="pr-select-wrap">
                      <select name="year" value={form.year} onChange={handleChange}
                        className={sc("year")}>
                        <option value="">Select Year</option>
                        {years.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <span className="pr-select-arrow">▾</span>
                    </div>
                    {errors.year && <p className="pr-error">{errors.year}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Personal Info */}
            {step === 2 && (
              <div className="pr-field-group">
                <div className="pr-grid-2">
                  <div className="pr-field">
                    <label className="pr-label">Gender *</label>
                    <div className="pr-select-wrap">
                      <select name="gender" value={form.gender} onChange={handleChange}
                        className={sc("gender")}>
                        <option value="">Select Gender</option>
                        {genders.map((g) => (
                          <option key={g} value={g}>{genderDisplayLabels[g] || g}</option>
                        ))}
                      </select>
                      <span className="pr-select-arrow">▾</span>
                    </div>
                    {errors.gender && <p className="pr-error">{errors.gender}</p>}
                  </div>
                  <div className="pr-field">
                    <label className="pr-label">Date of Birth *</label>
                    <input name="dob" type="date" value={form.dob} onChange={handleChange}
                      className={ic("dob")} />
                    {errors.dob && <p className="pr-error">{errors.dob}</p>}
                  </div>
                </div>

                <div className="pr-field">
                  <label className="pr-label">Native Place *</label>
                  <input name="native" value={form.native} onChange={handleChange}
                    placeholder="City, State" className={ic("native")} />
                  {errors.native && <p className="pr-error">{errors.native}</p>}
                </div>

                <div className="pr-grid-2">
                  <div className="pr-field">
                    <label className="pr-label">CGPA *</label>
                    <input name="cgpa" type="number" step="0.01" min="0" max="10"
                      value={form.cgpa} onChange={handleChange}
                      placeholder="e.g. 8.75" className={ic("cgpa")} />
                    {errors.cgpa && <p className="pr-error">{errors.cgpa}</p>}
                  </div>
                  <div className="pr-field">
                    <label className="pr-label">History of Arrears *</label>
                    <input name="historyOfArrears" type="number" min="0"
                      value={form.historyOfArrears} onChange={handleChange}
                      placeholder="0 if none" className={ic("historyOfArrears")} />
                    {errors.historyOfArrears && <p className="pr-error">{errors.historyOfArrears}</p>}
                  </div>
                </div>

                <div className="pr-field">
                  <label className="pr-label">Profile Picture</label>
                  <div className="pr-profile-row">
                    <div className="pr-profile-preview">
                      {profilePreview
                        ? <img src={profilePreview} alt="Profile" />
                        : <span className="pr-profile-placeholder">👤</span>}
                    </div>
                    <div className="pr-upload-zone" onClick={() => profileRef.current.click()}>
                      <p className="pr-upload-title">Click to upload photo</p>
                      <p className="pr-upload-hint">JPG, PNG • Max 2MB</p>
                      <input ref={profileRef} type="file" accept="image/*"
                        onChange={handleProfilePic} className="pr-hidden-input" />
                    </div>
                  </div>
                  {errors.profile && <p className="pr-error">{errors.profile}</p>}
                </div>
              </div>
            )}

            {/* STEP 3: Family Info */}
            {step === 3 && (
              <div className="pr-field-group">
                <div className="pr-family-box">
                  <p className="pr-section-label">Parent Information</p>
                  <div className="pr-family-fields">
                    <div className="pr-grid-2">
                      <div className="pr-field">
                        <label className="pr-label pr-label--muted">Father's Name *</label>
                        <input name="fatherName" value={form.fatherName} onChange={handleChange}
                          placeholder="Father's full name" className={ic("fatherName")} />
                        {errors.fatherName && <p className="pr-error">{errors.fatherName}</p>}
                      </div>
                      <div className="pr-field">
                        <label className="pr-label pr-label--muted">Mother's Name *</label>
                        <input name="motherName" value={form.motherName} onChange={handleChange}
                          placeholder="Mother's full name" className={ic("motherName")} />
                        {errors.motherName && <p className="pr-error">{errors.motherName}</p>}
                      </div>
                    </div>
                    <div className="pr-grid-2">
                      <div className="pr-field">
                        <label className="pr-label pr-label--muted">Father's Occupation *</label>
                        <input name="fatherOccupation" value={form.fatherOccupation} onChange={handleChange}
                          placeholder="Occupation" className={ic("fatherOccupation")} />
                        {errors.fatherOccupation && <p className="pr-error">{errors.fatherOccupation}</p>}
                      </div>
                      <div className="pr-field">
                        <label className="pr-label pr-label--muted">Mother's Occupation *</label>
                        <input name="motherOccupation" value={form.motherOccupation} onChange={handleChange}
                          placeholder="Occupation" className={ic("motherOccupation")} />
                        {errors.motherOccupation && <p className="pr-error">{errors.motherOccupation}</p>}
                      </div>
                    </div>
                    <div className="pr-grid-2">
                      <div className="pr-field">
                        <label className="pr-label pr-label--muted">Annual Family Income *</label>
                        <div className="pr-input-prefix-wrap">
                          <span className="pr-input-prefix">₹</span>
                          <input name="familyIncome" value={form.familyIncome} onChange={handleChange}
                            placeholder="e.g. 500000"
                            className={`${ic("familyIncome")} pr-input--prefixed`} />
                        </div>
                        {errors.familyIncome && <p className="pr-error">{errors.familyIncome}</p>}
                      </div>
                      <div className="pr-field">
                        <label className="pr-label pr-label--muted">Parent's Phone *</label>
                        <input name="parentPhone" value={form.parentPhone} onChange={handleChange}
                          placeholder="10-digit number" maxLength={10} className={ic("parentPhone")} />
                        {errors.parentPhone && <p className="pr-error">{errors.parentPhone}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Documents */}
            {step === 4 && (
              <div className="pr-field-group">
                <div className="pr-docs-box">
                  <p className="pr-section-label">Upload Documents</p>
                  <div className="pr-upload-zone--full" onClick={() => resumeRef.current.click()}>
                    <div className="pr-upload-icon">📄</div>
                    {resumeName ? (
                      <>
                        <p className="pr-upload-filename">{resumeName}</p>
                        <p className="pr-upload-success">✓ Resume uploaded</p>
                      </>
                    ) : (
                      <>
                        <p className="pr-upload-title">Upload Resume / CV *</p>
                        <p className="pr-upload-hint">PDF, DOC, DOCX • Max 5MB</p>
                      </>
                    )}
                    <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx"
                      onChange={handleResume} className="pr-hidden-input" />
                  </div>
                  {errors.resume && <p className="pr-error">{errors.resume}</p>}
                </div>

                <div className="pr-summary-box">
                  <p className="pr-summary-label">Registration Summary</p>
                  <div className="pr-summary-grid">
                    {[
                      ["Register No.", form.registerNumber || "—"],
                      ["Name", `${form.firstName} ${form.lastName}`.trim() || "—"],
                      ["Department", form.department || "—"],
                      ["Year", form.year || "—"],
                      ["Email", form.email || "—"],
                      ["Phone", form.phone || "—"],
                      ["CGPA", form.cgpa || "—"],
                      ["Arrears", form.historyOfArrears !== "" ? form.historyOfArrears : "—"],
                    ].map(([label, val]) => (
                      <div key={label} className="pr-summary-row">
                        <span className="pr-summary-key">{label}:</span>
                        <span className="pr-summary-val">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pr-info-banner">
                  <span className="pr-info-banner-icon">ℹ️</span>
                  <p className="pr-info-banner-text">
                    By submitting, you confirm that all provided information is accurate.
                    False information may result in disqualification from placement activities.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="pr-nav">
              <button type="button" onClick={prevStep} disabled={step === 1 || isSubmitting}
                className="pr-btn-prev">
                ← Previous
              </button>

              <div className="pr-dots">
                {steps.map((s) => (
                  <div key={s.id} className={dotClass(s.id)} />
                ))}
              </div>

              {step < 4
                ? <button type="button" onClick={nextStep} disabled={isSubmitting} className="pr-btn-next">
                    Next →
                  </button>
                : <button type="submit" disabled={isSubmitting} className="pr-btn-submit">
                    {isSubmitting ? "Submitting..." : "🚀 Submit Registration"}
                  </button>
              }
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="pr-footer">
          © 2025 Placement Portal • For support contact{" "}
          <span className="pr-footer-link">placement@college.edu</span>
        </p>
      </div>
    </div>
  );
}