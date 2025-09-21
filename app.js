// Dental Patient Records Management System - JavaScript

// Global variables
let patients = [];
let currentPatientId = null;
let editingMode = false;
let patientCounter = 1;
let teethConditions = {};

// Dental chart data
const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
const toothConditions = ['healthy', 'decay', 'filled', 'crown', 'extracted', 'rct', 'impacted'];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    try {
        loadPatientsFromStorage();
        generatePatientId();
        initializeDentalChart();
        renderPatientList();
        
        // Set up form submission
        const form = document.getElementById('patientForm');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }
        
        // Initialize sample data if needed
        if (patients.length === 0) {
            initializeSampleData();
        }
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
    }
});

// Local Storage Management
function savePatientsToStorage() {
    try {
        localStorage.setItem('dentalPatients', JSON.stringify(patients));
        localStorage.setItem('patientCounter', patientCounter.toString());
    } catch (error) {
        console.error('Error saving to storage:', error);
    }
}

function loadPatientsFromStorage() {
    try {
        const storedPatients = localStorage.getItem('dentalPatients');
        const storedCounter = localStorage.getItem('patientCounter');
        
        if (storedPatients) {
            patients = JSON.parse(storedPatients);
        }
        
        if (storedCounter) {
            patientCounter = parseInt(storedCounter);
        }
    } catch (error) {
        console.error('Error loading from storage:', error);
        patients = [];
        patientCounter = 1;
    }
}

// Patient ID Generation
function generatePatientId() {
    const id = `PA${patientCounter.toString().padStart(3, '0')}`;
    const patientIdField = document.getElementById('patientId');
    if (patientIdField) {
        patientIdField.value = id;
    }
    return id;
}

// Navigation Functions
function showPatientList() {
    try {
        document.getElementById('patientListView').classList.remove('hidden');
        document.getElementById('patientFormView').classList.add('hidden');
        document.getElementById('printView').classList.add('hidden');
        renderPatientList();
    } catch (error) {
        console.error('Error showing patient list:', error);
    }
}

function showAddPatientForm() {
    try {
        editingMode = false;
        currentPatientId = null;
        document.getElementById('formTitle').textContent = 'Add New Patient';
        document.getElementById('patientListView').classList.add('hidden');
        document.getElementById('patientFormView').classList.remove('hidden');
        document.getElementById('printView').classList.add('hidden');
        
        const printBtn = document.getElementById('printBtn');
        const exportBtn = document.getElementById('exportBtn');
        
        if (printBtn) printBtn.style.display = 'none';
        if (exportBtn) exportBtn.style.display = 'none';
        
        clearForm();
        generatePatientId();
    } catch (error) {
        console.error('Error showing add patient form:', error);
    }
}

function showEditPatientForm(patientId) {
    try {
        editingMode = true;
        currentPatientId = patientId;
        const patient = patients.find(p => p.id === patientId);
        
        if (patient) {
            document.getElementById('formTitle').textContent = 'Edit Patient Record';
            document.getElementById('patientListView').classList.add('hidden');
            document.getElementById('patientFormView').classList.remove('hidden');
            document.getElementById('printView').classList.add('hidden');
            
            const printBtn = document.getElementById('printBtn');
            const exportBtn = document.getElementById('exportBtn');
            
            if (printBtn) printBtn.style.display = 'inline-block';
            if (exportBtn) exportBtn.style.display = 'inline-block';
            
            populateForm(patient);
        }
    } catch (error) {
        console.error('Error showing edit patient form:', error);
    }
}

// Form Management
function clearForm() {
    try {
        const form = document.getElementById('patientForm');
        if (form) {
            form.reset();
        }
        teethConditions = {};
        updateDentalChart();
        calculatePending();
    } catch (error) {
        console.error('Error clearing form:', error);
    }
}

function populateForm(patient) {
    try {
        // Demographics
        setValue('patientId', patient.id);
        setValue('name', patient.name);
        setValue('age', patient.age);
        setValue('sex', patient.sex);
        setValue('phone', patient.phone);
        setValue('address', patient.address);
        setValue('occupation', patient.occupation);
        
        // Chief Complaint
        setValue('complaint', patient.complaint);
        setValue('hopi', patient.hopi);
        setValue('intensity', patient.intensity);
        setValue('nature', patient.nature);
        setValue('aggravating', patient.aggravating);
        setValue('relief', patient.relief);
        
        // Medical History
        setCheckbox('hypertension', patient.hypertension);
        setCheckbox('diabetes', patient.diabetes);
        setCheckbox('thyroid', patient.thyroid);
        setValue('medicalOthers', patient.medicalOthers);
        
        // Dental History
        setCheckbox('prevExtractions', patient.prevExtractions);
        setCheckbox('prevRestorations', patient.prevRestorations);
        setCheckbox('prevRCT', patient.prevRCT);
        setCheckbox('prevOrtho', patient.prevOrtho);
        setCheckbox('prevProsth', patient.prevProsth);
        setValue('dentalOthers', patient.dentalOthers);
        
        // Clinical Examination
        setCheckbox('impaction', patient.impaction);
        setCheckbox('opc', patient.opc);
        setCheckbox('abscess', patient.abscess);
        setCheckbox('rctNeeded', patient.rctNeeded);
        setCheckbox('crownNeeded', patient.crownNeeded);
        setCheckbox('mobility', patient.mobility);
        setCheckbox('cervicalDentin', patient.cervicalDentin);
        setCheckbox('gingivalRecession', patient.gingivalRecession);
        setValue('toothNumbers', patient.toothNumbers);
        setValue('clinicalOthers', patient.clinicalOthers);
        
        // Treatment Plan
        setCheckbox('gic', patient.gic);
        setCheckbox('composite', patient.composite);
        setCheckbox('treatmentCrown', patient.treatmentCrown);
        setCheckbox('extraction', patient.extraction);
        setCheckbox('xray', patient.xray);
        setCheckbox('treatmentRCT', patient.treatmentRCT);
        setCheckbox('treatmentOrtho', patient.treatmentOrtho);
        setValue('treatmentOthers', patient.treatmentOthers);
        
        // Prescription
        setCheckbox('amoxClav', patient.amoxClav);
        setCheckbox('paracetamol', patient.paracetamol);
        setCheckbox('zerodolP', patient.zerodolP);
        setCheckbox('hifinac', patient.hifinac);
        setCheckbox('flagyl', patient.flagyl);
        setCheckbox('pan', patient.pan);
        setValue('prescriptionOthers', patient.prescriptionOthers);
        
        // Payment
        setValue('paid', patient.paid);
        setValue('total', patient.total);
        setValue('pending', patient.pending);
        setValue('paymentMethod', patient.paymentMethod);
        
        // Visit Info
        setCheckbox('homeVisit', patient.homeVisit);
        setCheckbox('newPatient', patient.newPatient);
        setValue('appointment', patient.appointment);
        setValue('consultant', patient.consultant);
        setValue('expenses', patient.expenses);
        
        // Dental Chart
        teethConditions = patient.teethConditions || {};
        updateDentalChart();
    } catch (error) {
        console.error('Error populating form:', error);
    }
}

function setValue(id, value) {
    const element = document.getElementById(id);
    if (element && value !== undefined && value !== null) {
        element.value = value;
    }
}

function setCheckbox(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.checked = !!value;
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    try {
        if (!validateForm()) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
        
        const formData = collectFormData();
        
        if (editingMode && currentPatientId) {
            updatePatient(currentPatientId, formData);
            showToast('Patient record updated successfully', 'success');
        } else {
            addNewPatient(formData);
            showToast('Patient record saved successfully', 'success');
            patientCounter++;
        }
        
        savePatientsToStorage();
        setTimeout(() => showPatientList(), 1000);
    } catch (error) {
        console.error('Error handling form submit:', error);
        showToast('Error saving patient record', 'error');
    }
}

function validateForm() {
    const requiredFields = ['name', 'age', 'sex'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !field.value.trim()) {
            field.style.borderColor = 'red';
            isValid = false;
        } else if (field) {
            field.style.borderColor = '';
        }
    });
    
    return isValid;
}

function collectFormData() {
    const now = new Date().toISOString();
    const patientId = editingMode ? currentPatientId : generatePatientId();
    
    return {
        id: patientId,
        name: getValue('name'),
        age: parseInt(getValue('age')) || 0,
        sex: getValue('sex'),
        phone: getValue('phone'),
        address: getValue('address'),
        occupation: getValue('occupation'),
        
        // Chief Complaint
        complaint: getValue('complaint'),
        hopi: getValue('hopi'),
        intensity: getValue('intensity'),
        nature: getValue('nature'),
        aggravating: getValue('aggravating'),
        relief: getValue('relief'),
        
        // Medical History
        hypertension: getCheckbox('hypertension'),
        diabetes: getCheckbox('diabetes'),
        thyroid: getCheckbox('thyroid'),
        medicalOthers: getValue('medicalOthers'),
        
        // Dental History
        prevExtractions: getCheckbox('prevExtractions'),
        prevRestorations: getCheckbox('prevRestorations'),
        prevRCT: getCheckbox('prevRCT'),
        prevOrtho: getCheckbox('prevOrtho'),
        prevProsth: getCheckbox('prevProsth'),
        dentalOthers: getValue('dentalOthers'),
        
        // Clinical Examination
        impaction: getCheckbox('impaction'),
        opc: getCheckbox('opc'),
        abscess: getCheckbox('abscess'),
        rctNeeded: getCheckbox('rctNeeded'),
        crownNeeded: getCheckbox('crownNeeded'),
        mobility: getCheckbox('mobility'),
        cervicalDentin: getCheckbox('cervicalDentin'),
        gingivalRecession: getCheckbox('gingivalRecession'),
        toothNumbers: getValue('toothNumbers'),
        clinicalOthers: getValue('clinicalOthers'),
        
        // Treatment Plan
        gic: getCheckbox('gic'),
        composite: getCheckbox('composite'),
        treatmentCrown: getCheckbox('treatmentCrown'),
        extraction: getCheckbox('extraction'),
        xray: getCheckbox('xray'),
        treatmentRCT: getCheckbox('treatmentRCT'),
        treatmentOrtho: getCheckbox('treatmentOrtho'),
        treatmentOthers: getValue('treatmentOthers'),
        
        // Prescription
        amoxClav: getCheckbox('amoxClav'),
        paracetamol: getCheckbox('paracetamol'),
        zerodolP: getCheckbox('zerodolP'),
        hifinac: getCheckbox('hifinac'),
        flagyl: getCheckbox('flagyl'),
        pan: getCheckbox('pan'),
        prescriptionOthers: getValue('prescriptionOthers'),
        
        // Payment
        paid: parseFloat(getValue('paid')) || 0,
        total: parseFloat(getValue('total')) || 0,
        pending: parseFloat(getValue('pending')) || 0,
        paymentMethod: getValue('paymentMethod'),
        
        // Visit Info
        homeVisit: getCheckbox('homeVisit'),
        newPatient: getCheckbox('newPatient'),
        appointment: getValue('appointment'),
        consultant: getValue('consultant'),
        expenses: parseFloat(getValue('expenses')) || 0,
        
        // Dental Chart
        teethConditions: { ...teethConditions },
        
        // Timestamps
        createdAt: editingMode ? patients.find(p => p.id === patientId)?.createdAt || now : now,
        updatedAt: now
    };
}

function getValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : '';
}

function getCheckbox(id) {
    const element = document.getElementById(id);
    return element ? element.checked : false;
}

function addNewPatient(patientData) {
    patients.push(patientData);
}

function updatePatient(patientId, patientData) {
    const index = patients.findIndex(p => p.id === patientId);
    if (index !== -1) {
        patients[index] = patientData;
    }
}

function deletePatient(patientId) {
    try {
        if (confirm('Are you sure you want to delete this patient record? This action cannot be undone.')) {
            patients = patients.filter(p => p.id !== patientId);
            savePatientsToStorage();
            renderPatientList();
            showToast('Patient record deleted successfully', 'success');
        }
    } catch (error) {
        console.error('Error deleting patient:', error);
    }
}

// Patient List Rendering
function renderPatientList() {
    try {
        const grid = document.getElementById('patientsGrid');
        if (!grid) return;
        
        if (patients.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <h3>No Patient Records</h3>
                    <p>Click "Add New Patient" to create your first patient record.</p>
                </div>
            `;
            return;
        }
        
        const searchInput = document.getElementById('searchPatient');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        
        const filteredPatients = patients.filter(patient => 
            patient.name.toLowerCase().includes(searchTerm) ||
            patient.id.toLowerCase().includes(searchTerm) ||
            (patient.phone && patient.phone.includes(searchTerm))
        );
        
        grid.innerHTML = filteredPatients.map(patient => `
            <div class="patient-card" onclick="showEditPatientForm('${patient.id}')">
                <div class="patient-card-header">
                    <div>
                        <h3 class="patient-name">${patient.name}</h3>
                        <span class="patient-id">${patient.id}</span>
                    </div>
                    <div class="patient-card-actions" onclick="event.stopPropagation()">
                        <button class="card-action-btn" onclick="exportPatientData('${patient.id}')" title="Export">📄</button>
                        <button class="card-action-btn delete" onclick="deletePatient('${patient.id}')" title="Delete">🗑️</button>
                    </div>
                </div>
                <div class="patient-details">
                    <div><strong>Age/Sex:</strong> ${patient.age}/${patient.sex}</div>
                    <div><strong>Phone:</strong> ${patient.phone || 'Not provided'}</div>
                    <div><strong>Complaint:</strong> ${patient.complaint || 'None'}</div>
                    <div class="patient-status">
                        <span class="status-dot ${getPaymentStatus(patient)}"></span>
                        Payment: ₹${patient.paid || 0}/${patient.total || 0} ${(patient.pending || 0) > 0 ? `(₹${patient.pending} pending)` : '(Paid)'}
                    </div>
                    ${patient.newPatient ? '<div class="status new">New Patient</div>' : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error rendering patient list:', error);
    }
}

function getPaymentStatus(patient) {
    const pending = patient.pending || 0;
    const paid = patient.paid || 0;
    const total = patient.total || 0;
    
    if (pending > 0) return 'pending';
    if (paid >= total && total > 0) return 'paid';
    return 'new';
}

function filterPatients() {
    renderPatientList();
}

// Dental Chart Functions
function initializeDentalChart() {
    try {
        const upperTeethContainer = document.getElementById('upperTeeth');
        const lowerTeethContainer = document.getElementById('lowerTeeth');
        
        if (upperTeethContainer) {
            upperTeethContainer.innerHTML = upperTeeth.map(toothNum => 
                `<div class="tooth" data-tooth="${toothNum}" onclick="toggleToothCondition(${toothNum})">${toothNum}</div>`
            ).join('');
        }
        
        if (lowerTeethContainer) {
            lowerTeethContainer.innerHTML = lowerTeeth.map(toothNum => 
                `<div class="tooth" data-tooth="${toothNum}" onclick="toggleToothCondition(${toothNum})">${toothNum}</div>`
            ).join('');
        }
    } catch (error) {
        console.error('Error initializing dental chart:', error);
    }
}

function toggleToothCondition(toothNumber) {
    try {
        const currentCondition = teethConditions[toothNumber] || 'healthy';
        const currentIndex = toothConditions.indexOf(currentCondition);
        const nextIndex = (currentIndex + 1) % toothConditions.length;
        
        teethConditions[toothNumber] = toothConditions[nextIndex];
        updateDentalChart();
    } catch (error) {
        console.error('Error toggling tooth condition:', error);
    }
}

function updateDentalChart() {
    try {
        document.querySelectorAll('.tooth').forEach(tooth => {
            const toothNumber = parseInt(tooth.dataset.tooth);
            const condition = teethConditions[toothNumber] || 'healthy';
            
            // Remove all condition classes
            toothConditions.forEach(conditionClass => {
                tooth.classList.remove(conditionClass);
            });
            
            // Add current condition class
            tooth.classList.add(condition);
        });
    } catch (error) {
        console.error('Error updating dental chart:', error);
    }
}

// Payment Calculations
function calculatePending() {
    try {
        const paid = parseFloat(getValue('paid')) || 0;
        const total = parseFloat(getValue('total')) || 0;
        const pending = Math.max(0, total - paid);
        
        const pendingField = document.getElementById('pending');
        if (pendingField) {
            pendingField.value = pending.toFixed(2);
        }
    } catch (error) {
        console.error('Error calculating pending amount:', error);
    }
}

// Import/Export Functions
function exportAllData() {
    try {
        const data = {
            patients: patients,
            exportDate: new Date().toISOString(),
            totalPatients: patients.length
        };
        
        downloadJSON(data, `dental-patients-${new Date().toISOString().split('T')[0]}.json`);
        showToast('Patient data exported successfully', 'success');
    } catch (error) {
        console.error('Error exporting all data:', error);
        showToast('Error exporting data', 'error');
    }
}

function exportPatientData(patientId = null) {
    try {
        const patient = patientId ? 
            patients.find(p => p.id === patientId) : 
            patients.find(p => p.id === currentPatientId);
        
        if (!patient) {
            showToast('Patient not found', 'error');
            return;
        }
        
        const data = {
            patient: patient,
            exportDate: new Date().toISOString()
        };
        
        downloadJSON(data, `patient-${patient.id}-${patient.name.replace(/\s+/g, '-')}.json`);
        showToast('Patient data exported successfully', 'success');
    } catch (error) {
        console.error('Error exporting patient data:', error);
        showToast('Error exporting patient data', 'error');
    }
}

function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData() {
    try {
        const fileInput = document.getElementById('importFile');
        if (fileInput) {
            fileInput.click();
        }
    } catch (error) {
        console.error('Error importing data:', error);
    }
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.patients && Array.isArray(data.patients)) {
                // Import all patients
                const importedCount = data.patients.length;
                
                // Merge with existing patients, avoiding duplicates
                data.patients.forEach(importedPatient => {
                    const existingIndex = patients.findIndex(p => p.id === importedPatient.id);
                    if (existingIndex !== -1) {
                        patients[existingIndex] = importedPatient;
                    } else {
                        patients.push(importedPatient);
                    }
                });
                
                // Update counter
                if (patients.length > 0) {
                    const maxId = Math.max(...patients.map(p => parseInt(p.id.replace('PA', ''))));
                    patientCounter = maxId + 1;
                }
                
                savePatientsToStorage();
                renderPatientList();
                showToast(`Successfully imported ${importedCount} patient records`, 'success');
            } else if (data.patient) {
                // Import single patient
                const existingIndex = patients.findIndex(p => p.id === data.patient.id);
                if (existingIndex !== -1) {
                    patients[existingIndex] = data.patient;
                } else {
                    patients.push(data.patient);
                }
                
                savePatientsToStorage();
                renderPatientList();
                showToast('Patient record imported successfully', 'success');
            } else {
                showToast('Invalid file format', 'error');
            }
        } catch (error) {
            console.error('Error importing file:', error);
            showToast('Error importing file: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Clear the input
}

// Print Functions
function printPatientRecord() {
    try {
        if (!currentPatientId) {
            showToast('No patient selected for printing', 'error');
            return;
        }
        
        const patient = patients.find(p => p.id === currentPatientId);
        if (!patient) {
            showToast('Patient not found', 'error');
            return;
        }
        
        generatePrintView(patient);
        setTimeout(() => window.print(), 100);
    } catch (error) {
        console.error('Error printing patient record:', error);
        showToast('Error printing record', 'error');
    }
}

function generatePrintView(patient) {
    try {
        const printView = document.getElementById('printView');
        if (!printView) return;
        
        printView.innerHTML = `
            <div class="print-content">
                <div class="print-header">
                    <h1>🦷 Dental Patient Record</h1>
                    <p>Patient ID: ${patient.id}</p>
                    <p>Date: ${new Date(patient.updatedAt).toLocaleDateString()}</p>
                </div>
                
                <div class="print-section">
                    <h3>Patient Demographics</h3>
                    <div class="print-field"><span class="print-label">Name:</span><span class="print-value">${patient.name}</span></div>
                    <div class="print-field"><span class="print-label">Age/Sex:</span><span class="print-value">${patient.age}/${patient.sex}</span></div>
                    <div class="print-field"><span class="print-label">Phone:</span><span class="print-value">${patient.phone || 'N/A'}</span></div>
                    <div class="print-field"><span class="print-label">Address:</span><span class="print-value">${patient.address || 'N/A'}</span></div>
                    <div class="print-field"><span class="print-label">Occupation:</span><span class="print-value">${patient.occupation || 'N/A'}</span></div>
                </div>
                
                <div class="print-section">
                    <h3>Chief Complaint & History</h3>
                    <div class="print-field"><span class="print-label">Complaint:</span><span class="print-value">${patient.complaint || 'None'}</span></div>
                    <div class="print-field"><span class="print-label">History:</span><span class="print-value">${patient.hopi || 'None'}</span></div>
                    <div class="print-field"><span class="print-label">Intensity:</span><span class="print-value">${patient.intensity || 'N/A'}</span></div>
                    <div class="print-field"><span class="print-label">Nature:</span><span class="print-value">${patient.nature || 'N/A'}</span></div>
                </div>
                
                <div class="print-section">
                    <h3>Medical History</h3>
                    <div class="print-field"><span class="print-label">Hypertension:</span><span class="print-value">${patient.hypertension ? 'Yes' : 'No'}</span></div>
                    <div class="print-field"><span class="print-label">Diabetes:</span><span class="print-value">${patient.diabetes ? 'Yes' : 'No'}</span></div>
                    <div class="print-field"><span class="print-label">Thyroid:</span><span class="print-value">${patient.thyroid ? 'Yes' : 'No'}</span></div>
                    <div class="print-field"><span class="print-label">Others:</span><span class="print-value">${patient.medicalOthers || 'None'}</span></div>
                </div>
                
                <div class="print-section">
                    <h3>Treatment Plan</h3>
                    <div class="print-field"><span class="print-label">GIC:</span><span class="print-value">${patient.gic ? 'Yes' : 'No'}</span></div>
                    <div class="print-field"><span class="print-label">Composite:</span><span class="print-value">${patient.composite ? 'Yes' : 'No'}</span></div>
                    <div class="print-field"><span class="print-label">Crown:</span><span class="print-value">${patient.treatmentCrown ? 'Yes' : 'No'}</span></div>
                    <div class="print-field"><span class="print-label">RCT:</span><span class="print-value">${patient.treatmentRCT ? 'Yes' : 'No'}</span></div>
                    <div class="print-field"><span class="print-label">Extraction:</span><span class="print-value">${patient.extraction ? 'Yes' : 'No'}</span></div>
                    <div class="print-field"><span class="print-label">Others:</span><span class="print-value">${patient.treatmentOthers || 'None'}</span></div>
                </div>
                
                <div class="print-section">
                    <h3>Payment Details</h3>
                    <div class="print-field"><span class="print-label">Total:</span><span class="print-value">₹${patient.total || 0}</span></div>
                    <div class="print-field"><span class="print-label">Paid:</span><span class="print-value">₹${patient.paid || 0}</span></div>
                    <div class="print-field"><span class="print-label">Pending:</span><span class="print-value">₹${patient.pending || 0}</span></div>
                    <div class="print-field"><span class="print-label">Method:</span><span class="print-value">${patient.paymentMethod || 'N/A'}</span></div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error generating print view:', error);
    }
}

// Toast Notifications
function showToast(message, type = 'success') {
    try {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        if (toast && toastMessage) {
            toastMessage.textContent = message;
            toast.className = `toast ${type}`;
            toast.classList.remove('hidden');
            
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 5000);
        }
    } catch (error) {
        console.error('Error showing toast:', error);
    }
}

function hideToast() {
    try {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error hiding toast:', error);
    }
}

// Initialize sample data if none exists
function initializeSampleData() {
    const samplePatient = {
        id: 'PA001',
        name: 'Sample Patient',
        age: 35,
        sex: 'Male',
        phone: '9876543210',
        address: '123 Main Street, City',
        occupation: 'Engineer',
        complaint: 'Tooth pain',
        intensity: 'moderate',
        nature: 'throbbing',
        hypertension: false,
        diabetes: false,
        thyroid: false,
        paid: 500,
        total: 1000,
        pending: 500,
        paymentMethod: 'Cash',
        newPatient: true,
        teethConditions: { 16: 'decay', 17: 'filled' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    patients.push(samplePatient);
    patientCounter = 2;
    savePatientsToStorage();
    renderPatientList();
}