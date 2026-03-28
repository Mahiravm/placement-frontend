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
const genders = ["Male", "Female", "Other", "Prefer not to say"];

export default function PlacementRegistration() {
  const [step, setStep] = useState(1);
  const [profilePreview, setProfilePreview] = useState(null);
  const [resumeName, setResumeName] = useState("");
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
  };

  const handleProfilePic = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleResume = (e) => {
    const file = e.target.files[0];
    if (file) setResumeName(file.name);
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

  const nextStep = () => { if (validateStep()) setStep((s) => Math.min(s + 1, 4)); };
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep()) alert("🎉 Registration submitted successfully!");
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
                        {genders.map((g) => <option key={g} value={g}>{g}</option>)}
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
                        <p className="pr-upload-title">Upload Resume / CV</p>
                        <p className="pr-upload-hint">PDF, DOC, DOCX • Max 5MB</p>
                      </>
                    )}
                    <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx"
                      onChange={handleResume} className="pr-hidden-input" />
                  </div>
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
              <button type="button" onClick={prevStep} disabled={step === 1}
                className="pr-btn-prev">
                ← Previous
              </button>

              <div className="pr-dots">
                {steps.map((s) => (
                  <div key={s.id} className={dotClass(s.id)} />
                ))}
              </div>

              {step < 4
                ? <button type="button" onClick={nextStep} className="pr-btn-next">
                    Next →
                  </button>
                : <button type="submit" className="pr-btn-submit">
                    🚀 Submit Registration
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