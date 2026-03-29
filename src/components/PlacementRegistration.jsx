import { useState, useRef, useEffect, useCallback } from "react";
import "./PlacementRegistration.css";

// ─── Constants ───────────────────────────────────────────────────────────────

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

const genders = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"];
const genderDisplayLabels = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
  PREFER_NOT_TO_SAY: "Prefer not to say",
};

const yearMapping = {
  "1st Year": "FIRST_YEAR",
  "2nd Year": "SECOND_YEAR",
  "3rd Year": "THIRD_YEAR",
  "4th Year": "FOURTH_YEAR",
};

const departmentMapping = {
  "Computer Science & Engineering": "CSE",
  "Information Technology": "IT",
  "Electronics & Communication": "ECE",
  "Electrical & Electronics": "EEE",
  "Mechanical Engineering": "MECH",
  "Civil Engineering": "CIVIL",
  "Chemical Engineering": "CHEM",
  "Biomedical Engineering": "BME",
};

const API_BASE_URL = "http://localhost:8080/api/students";
const STORAGE_KEY = "placementForm";
const SUBMITTED_KEY = "placementFormSubmitted";

// ─── Toast Component ──────────────────────────────────────────────────────────

function Toast({ toasts, removeToast }) {
  return (
    <div className="pr-toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`pr-toast pr-toast--${t.type}`}>
          <span className="pr-toast-icon">
            {t.type === "success" ? "✅" : t.type === "error" ? "❌" : t.type === "warning" ? "⚠️" : "ℹ️"}
          </span>
          <span className="pr-toast-msg">{t.message}</span>
          <button className="pr-toast-close" onClick={() => removeToast(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
}

// ─── useToast Hook ────────────────────────────────────────────────────────────

function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

// ─── Validation ───────────────────────────────────────────────────────────────

const REGISTER_NUMBER_REGEX = /^[A-Za-z0-9]{4,20}$/;
const NAME_REGEX = /^[A-Za-z\s'-]{2,50}$/;
const PHONE_REGEX = /^\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INCOME_REGEX = /^\d+(\.\d{1,2})?$/;

function validateStep(step, form) {
  const errors = {};

  if (step === 1) {
    if (!form.registerNumber.trim())
      errors.registerNumber = "Register number is required";
    else if (!REGISTER_NUMBER_REGEX.test(form.registerNumber.trim()))
      errors.registerNumber = "Only letters and digits, 4–20 characters";

    if (!form.firstName.trim()) errors.firstName = "First name is required";
    else if (!NAME_REGEX.test(form.firstName.trim()))
      errors.firstName = "Enter a valid first name (letters only, 2–50 chars)";

    if (!form.lastName.trim()) errors.lastName = "Last name is required";
    else if (!NAME_REGEX.test(form.lastName.trim()))
      errors.lastName = "Enter a valid last name (letters only, 2–50 chars)";

    if (!form.phone.trim()) errors.phone = "Phone number is required";
    else if (!PHONE_REGEX.test(form.phone.trim()))
      errors.phone = "Enter a valid 10-digit mobile number";

    if (!form.email.trim()) errors.email = "Email is required";
    else if (!EMAIL_REGEX.test(form.email.trim()))
      errors.email = "Enter a valid email address";

    if (!form.department) errors.department = "Please select a department";
    if (!form.year) errors.year = "Please select your year";
  }

  if (step === 2) {
    if (!form.gender) errors.gender = "Please select your gender";

    if (!form.dob) {
      errors.dob = "Date of birth is required";
    } else {
      const dob = new Date(form.dob);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (dob >= today) errors.dob = "Date of birth must be in the past";
      else if (age < 15 || age > 35)
        errors.dob = "Age must be between 15 and 35 years";
    }

    if (!form.native.trim()) errors.native = "Native place is required";
    else if (form.native.trim().length < 2)
      errors.native = "Enter at least 2 characters";

    if (form.cgpa === "") errors.cgpa = "CGPA is required";
    else if (isNaN(form.cgpa) || Number(form.cgpa) < 0 || Number(form.cgpa) > 10)
      errors.cgpa = "CGPA must be between 0.00 and 10.00";

    if (form.historyOfArrears === "")
      errors.historyOfArrears = "History of arrears is required (enter 0 if none)";
    else if (
      isNaN(form.historyOfArrears) ||
      parseInt(form.historyOfArrears) < 0
    )
      errors.historyOfArrears = "Must be 0 or a positive number";
  }

  if (step === 3) {
    if (!form.fatherName.trim()) errors.fatherName = "Father's name is required";
    else if (!NAME_REGEX.test(form.fatherName.trim()))
      errors.fatherName = "Enter a valid name";

    if (!form.motherName.trim()) errors.motherName = "Mother's name is required";
    else if (!NAME_REGEX.test(form.motherName.trim()))
      errors.motherName = "Enter a valid name";

    if (!form.fatherOccupation.trim())
      errors.fatherOccupation = "Father's occupation is required";
    if (!form.motherOccupation.trim())
      errors.motherOccupation = "Mother's occupation is required";

    if (!form.familyIncome.toString().trim())
      errors.familyIncome = "Family income is required";
    else if (!INCOME_REGEX.test(form.familyIncome.toString().trim()) || Number(form.familyIncome) < 0)
      errors.familyIncome = "Enter a valid positive income amount";

    if (!form.parentPhone.trim())
      errors.parentPhone = "Parent's phone number is required";
    else if (!PHONE_REGEX.test(form.parentPhone.trim()))
      errors.parentPhone = "Enter a valid 10-digit phone number";
    else if (
      form.phone.trim() &&
      PHONE_REGEX.test(form.phone.trim()) &&
      form.parentPhone.trim() === form.phone.trim()
    )
      errors.parentPhone =
        "Parent's phone number must differ from student's phone number";
  }

  if (step === 4) {
    // resume is validated in handleSubmit
  }

  return errors;
}

// ─── Main Component ───────────────────────────────────────────────────────────

const INITIAL_FORM = {
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
};

export default function PlacementRegistration() {
  const [step, setStep] = useState(1);
  const [profilePreview, setProfilePreview] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeName, setResumeName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});


  const profileRef = useRef();
  const resumeRef = useRef();
  const submitLockRef = useRef(false); // double-submission lock

  const { toasts, addToast, removeToast } = useToast();

  // ── Restore saved progress ────────────────────────────────────────────────
  // sessionStorage is used so data never survives a page refresh.
  // A refresh always shows a blank form — even after successful submission.
  useEffect(() => {
    // If the form was submitted in this same tab session, show the success screen.
    // On page refresh, sessionStorage is cleared by the browser, so this never fires.
    if (sessionStorage.getItem(SUBMITTED_KEY) === "true") {
      setSubmitted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-save on change ───────────────────────────────────────────────────
  useEffect(() => {
    if (submitted) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form, submitted]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleProfilePic = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrors((p) => ({ ...p, profile: "File size must be under 2MB" }));
      addToast("Profile picture too large (max 2MB)", "error");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, profile: "Please upload a valid image file" }));
      addToast("Invalid file type. Please upload an image.", "error");
      return;
    }
    setProfileFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setProfilePreview(reader.result);
    reader.readAsDataURL(file);
    setErrors((p) => ({ ...p, profile: "" }));
    addToast("Profile picture selected ✓", "success", 2500);
  };

  const handleResume = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, resume: "File size must be under 5MB" }));
      addToast("Resume too large (max 5MB)", "error");
      return;
    }
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      setErrors((p) => ({ ...p, resume: "Upload a PDF or DOC/DOCX file" }));
      addToast("Invalid file type. PDF, DOC, or DOCX only.", "error");
      return;
    }
    setResumeFile(file);
    setResumeName(file.name);
    setErrors((p) => ({ ...p, resume: "" }));
    addToast("Resume uploaded ✓", "success", 2500);
  };

  // ── Navigation ────────────────────────────────────────────────────────────

  const nextStep = () => {
    const errs = validateStep(step, form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      addToast("Please fix the errors before continuing", "warning");
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, 4));
    addToast(`Step ${step} complete ✓`, "success", 2000);
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // ── API calls ─────────────────────────────────────────────────────────────

  const submitRegistrationData = async () => {
    const registrationData = {
      registerNumber: form.registerNumber.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      department: departmentMapping[form.department] || form.department,
      year: yearMapping[form.year] || form.year,
      gender: form.gender,
      dob: form.dob,
      nativePlace: form.native.trim(),
      cgpa: parseFloat(form.cgpa),
      historyOfArrears: parseInt(form.historyOfArrears) || 0,
      fatherName: form.fatherName.trim(),
      motherName: form.motherName.trim(),
      fatherOccupation: form.fatherOccupation.trim(),
      motherOccupation: form.motherOccupation.trim(),
      familyIncome: parseFloat(form.familyIncome),
      parentPhone: form.parentPhone.trim(),
    };

    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registrationData),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Registration failed");

    // Retrieve the new student ID
    const getResp = await fetch(`${API_BASE_URL}`);
    const all = await getResp.json();
    return all[all.length - 1]?.id;
  };

  const uploadProfilePicture = async (id) => {
    if (!profileFile) return;
    const fd = new FormData();
    fd.append("file", profileFile);
    const res = await fetch(`${API_BASE_URL}/${id}/profile-picture`, {
      method: "POST",
      body: fd,
    });
    const r = await res.json();
    if (!res.ok) throw new Error(r.message || "Profile picture upload failed");
    return r.url;
  };

  const uploadResume = async (id) => {
    if (!resumeFile) return;
    const fd = new FormData();
    fd.append("file", resumeFile);
    const res = await fetch(`${API_BASE_URL}/${id}/resume`, {
      method: "POST",
      body: fd,
    });
    const r = await res.json();
    if (!res.ok) throw new Error(r.message || "Resume upload failed");
    return r.url;
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (submitLockRef.current || isSubmitting) {
      addToast("Submission already in progress, please wait…", "warning");
      return;
    }

    // Validate step 4
    const errs = validateStep(4, form);
    if (!resumeFile) {
      errs.resume = "Please upload your resume before submitting";
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      addToast("Please upload your resume to continue", "warning");
      return;
    }

    // Acquire lock
    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      const id = await submitRegistrationData();
      if (!id) throw new Error("Could not retrieve registration ID");

      if (profileFile) {
        await uploadProfilePicture(id);
        addToast("Profile picture uploaded ✓", "success", 2500);
      }

      await uploadResume(id);
      addToast("Resume uploaded ✓", "success", 2500);

      // Mark as submitted and clear saved draft
      sessionStorage.setItem(SUBMITTED_KEY, "true");
      sessionStorage.removeItem(STORAGE_KEY);
      setSubmitted(true);

      addToast("🎉 Registration submitted successfully!", "success", 6000);
    } catch (error) {
      console.error("Submission error:", error);
      addToast(`Registration failed: ${error.message}. Please try again.`, "error", 6000);
    } finally {
      setIsSubmitting(false);
      submitLockRef.current = false;
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

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

  // ── Already submitted guard ───────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="pr-page">
        <Toast toasts={toasts} removeToast={removeToast} />
        <div className="pr-container">
          <div className="pr-success-screen">
            <div className="pr-success-icon">🎉</div>
            <h2 className="pr-success-title">Registration Complete!</h2>
            <p className="pr-success-msg">
              Your placement registration has been submitted successfully.
              The placement cell will reach out to you via email.
            </p>
            <p className="pr-success-email">{form.email}</p>
          </div>
          <p className="pr-footer">
            © 2025 Placement Portal • For support contact{" "}
            <span className="pr-footer-link">placement@college.edu</span>
          </p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="pr-page">
      {/* Toast notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />

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
          <form className="pr-form" onSubmit={handleSubmit} noValidate>

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
                      max={new Date().toISOString().split("T")[0]}
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
                        <label className="pr-label pr-label--muted">
                          Parent's Phone *
                          <span className="pr-label-hint"> (must differ from student's)</span>
                        </label>
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
                : <button
                    type="submit"
                    disabled={isSubmitting || submitLockRef.current}
                    className={`pr-btn-submit${isSubmitting ? " pr-btn-submit--loading" : ""}`}
                  >
                    {isSubmitting ? (
                      <><span className="pr-spinner" /> Submitting…</>
                    ) : (
                      "🚀 Submit Registration"
                    )}
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