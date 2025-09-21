// Dentartica Dental Clinic - Patient Records Management System

// Global variables
let patients = [];
let currentPatientId = null;
let editingMode = false;
let patientCounter = 1;
let teethConditions = {};
let isAuthenticated = false;
let sessionTimeout = null;

// Authentication settings
const CLINIC_PASSWORD = "dentist123";
const SESSION_TIMEOUT = 3600000; // 1 hour in milliseconds

// Dental chart data
const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
const toothConditions = ['healthy', 'decay', 'filled', 'crown', 'extracted', 'rct', 'impacted'];

// Clinic information for print reports
const CLINIC_INFO = {
    name: "DENTARTICA DENTAL CLINIC"
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('Dentartica Dental Clinic application starting...');
        
        // Check if user is already authenticated
        if (checkAuthentication()) {
            showMainApplication();
            initializeApplication();
        } else {
            showLoginScreen();
        }
        
        // Set up login form event listeners
        setupLoginForm();
        
        console.log('Dentartica Dental Clinic application initialized');
    } catch (error) {
        console.error('Error initializing application:', error);
        alert('Error initializing application. Please refresh the page.');
    }
});

// Setup login form event listeners
function setupLoginForm() {
    try {
        const loginForm = document.getElementById('loginForm');
        const passwordField = document.getElementById('loginPassword');
        
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                console.log('Login form submitted via event listener');
                handleLogin(e);
            });
        }
        
        if (passwordField) {
            // Handle Enter key press
            passwordField.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    console.log('Enter key pressed in password field');
                    handleLogin(e);
                }
            });
            
            // Clear error on input
            passwordField.addEventListener('input', function() {
                const errorElement = document.getElementById('loginError');
                if (errorElement) {
                    errorElement.classList.add('hidden');
                }
            });
        }
        
        console.log('Login form event listeners set up successfully');
    } catch (error) {
        console.error('Error setting up login form:', error);
    }
}

// Authentication Functions
function checkAuthentication() {
    try {
        const sessionData = sessionStorage.getItem('dentarticaAuth');
        const rememberData = localStorage.getItem('dentarticaRemember');
        
        if (sessionData) {
            const session = JSON.parse(sessionData);
            const now = new Date().getTime();
            
            if (now - session.timestamp < SESSION_TIMEOUT) {
                isAuthenticated = true;
                setupSessionTimeout();
                return true;
            } else {
                sessionStorage.removeItem('dentarticaAuth');
            }
        }
        
        if (rememberData) {
            const remember = JSON.parse(rememberData);
            const now = new Date().getTime();
            
            // Remember me lasts for 7 days
            if (now - remember.timestamp < 7 * 24 * 60 * 60 * 1000) {
                isAuthenticated = true;
                setupSession(true);
                setupSessionTimeout();
                return true;
            } else {
                localStorage.removeItem('dentarticaRemember');
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
}

function handleLogin(e) {
    if (e) {
        e.preventDefault();
    }
    
    try {
        console.log('Login attempt started...');
        
        const passwordField = document.getElementById('loginPassword');
        const rememberCheckbox = document.getElementById('rememberMe');
        const errorElement = document.getElementById('loginError');
        
        if (!passwordField) {
            console.error('Password field not found');
            alert('Login form error. Please refresh the page.');
            return;
        }
        
        if (!rememberCheckbox) {
            console.error('Remember checkbox not found');
            alert('Login form error. Please refresh the page.');
            return;
        }
        
        if (!errorElement) {
            console.error('Error element not found');
            alert('Login form error. Please refresh the page.');
            return;
        }
        
        const password = passwordField.value;
        const rememberMe = rememberCheckbox.checked;
        
        console.log('Password entered:', password ? 'Yes' : 'No');
        console.log('Password value:', password);
        console.log('Expected password:', CLINIC_PASSWORD);
        console.log('Remember me checked:', rememberMe);
        
        if (password === CLINIC_PASSWORD) {
            console.log('Password correct, authenticating...');
            
            isAuthenticated = true;
            setupSession(rememberMe);
            setupSessionTimeout();
            
            // Hide error message
            errorElement.classList.add('hidden');
            
            // Show main application
            showMainApplication();
            initializeApplication();
            
            showToast('Welcome to Dentartica Dental Clinic!', 'success');
            
            // Clear the password field
            passwordField.value = '';
        } else {
            console.log('Password incorrect');
            
            // Show error message
            errorElement.textContent = 'Incorrect password. Please try again.';
            errorElement.classList.remove('hidden');
            
            // Focus back to password field
            passwordField.focus();
            passwordField.select();
            
            // Add shake animation to login container
            const loginContainer = document.querySelector('.login-container');
            if (loginContainer) {
                loginContainer.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    loginContainer.style.animation = '';
                }, 500);
            }
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('Login error occurred. Please try again.');
    }
}

function setupSession(remember = false) {
    try {
        const timestamp = new Date().getTime();
        
        // Always create session storage
        sessionStorage.setItem('dentarticaAuth', JSON.stringify({
            timestamp: timestamp,
            authenticated: true
        }));
        
        // Create remember me if requested
        if (remember) {
            localStorage.setItem('dentarticaRemember', JSON.stringify({
                timestamp: timestamp,
                authenticated: true
            }));
        }
        
        console.log('Session setup complete. Remember me:', remember);
    } catch (error) {
        console.error('Error setting up session:', error);
    }
}

function setupSessionTimeout() {
    // Clear existing timeout
    if (sessionTimeout) {
        clearTimeout(sessionTimeout);
    }
    
    // Set new timeout
    sessionTimeout = setTimeout(() => {
        logout(true);
    }, SESSION_TIMEOUT);
}

function logout(isTimeout = false) {
    try {
        isAuthenticated = false;
        
        // Clear session data
        sessionStorage.removeItem('dentarticaAuth');
        // Don't remove remember me on manual logout unless it's a timeout
        if (isTimeout) {
            localStorage.removeItem('dentarticaRemember');
        }
        
        // Clear timeout
        if (sessionTimeout) {
            clearTimeout(sessionTimeout);
            sessionTimeout = null;
        }
        
        // Show login screen
        showLoginScreen();
        
        const message = isTimeout ? 'Session expired. Please log in again.' : 'Logged out successfully';
        showToast(message, isTimeout ? 'error' : 'success');
    } catch (error) {
        console.error('Error during logout:', error);
    }
}

function togglePasswordVisibility() {
    try {
        const passwordField = document.getElementById('loginPassword');
        const toggleButton = document.querySelector('.password-toggle');
        
        if (!passwordField || !toggleButton) {
            console.error('Password field or toggle button not found');
            return;
        }
        
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            toggleButton.textContent = '🙈';
        } else {
            passwordField.type = 'password';
            toggleButton.textContent = '👁️';
        }
    } catch (error) {
        console.error('Error toggling password visibility:', error);
    }
}

function showLoginScreen() {
    try {
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApplication');
        
        if (loginScreen && mainApp) {
            loginScreen.style.display = 'flex';
            mainApp.classList.add('hidden');
        }
        
        // Reset login form
        const passwordField = document.getElementById('loginPassword');
        const rememberCheckbox = document.getElementById('rememberMe');
        const errorElement = document.getElementById('loginError');
        
        if (passwordField) passwordField.value = '';
        if (rememberCheckbox) rememberCheckbox.checked = false;
        if (errorElement) errorElement.classList.add('hidden');
        
        // Focus password field
        setTimeout(() => {
            if (passwordField) {
                passwordField.focus();
            }
        }, 100);
        
        console.log('Login screen displayed');
    } catch (error) {
        console.error('Error showing login screen:', error);
    }
}

function showMainApplication() {
    try {
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApplication');
        
        if (loginScreen && mainApp) {
            loginScreen.style.display = 'none';
            mainApp.classList.remove('hidden');
        }
        
        console.log('Main application displayed');
    } catch (error) {
        console.error('Error showing main application:', error);
    }
}

// Main Application Initialization
function initializeApplication() {
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
        
        console.log('Main application initialized successfully');
        console.log('Total patients loaded:', patients.length);
    } catch (error) {
        console.error('Error initializing main application:', error);
    }
}

// Local Storage Management
function savePatientsToStorage() {
    try {
        if (!isAuthenticated) return;
        
        // Create encrypted-like key for better security
        const storageKey = 'dentarticaPatients_' + btoa('clinic_data');
        localStorage.setItem(storageKey, JSON.stringify(patients));
        localStorage.setItem('dentarticaCounter', patientCounter.toString());
    } catch (error) {
        console.error('Error saving to storage:', error);
        showToast('Error saving data to storage', 'error');
    }
}

function loadPatientsFromStorage() {
    try {
        const storageKey = 'dentarticaPatients_' + btoa('clinic_data');
        const storedPatients = localStorage.getItem(storageKey);
        const storedCounter = localStorage.getItem('dentarticaCounter');
        
        if (storedPatients) {
            patients = JSON.parse(storedPatients);
        } else {
            patients = []; // Start with empty database - no sample data
        }
        
        if (storedCounter) {
            patientCounter = parseInt(storedCounter);
        } else {
            patientCounter = 1;
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
        setupSessionTimeout(); // Reset timeout on activity
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
        setupSessionTimeout(); // Reset timeout on activity
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
        setupSessionTimeout(); // Reset timeout on activity
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
        setupSessionTimeout(); // Reset timeout on activity
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
            setupSessionTimeout(); // Reset timeout on activity
        }
    } catch (error) {
        console.error('Error deleting patient:', error);
        showToast('Error deleting patient record', 'error');
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
                    <p>Click "Add New Patient" to create your first patient record for Dentartica Dental Clinic.</p>
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
    setupSessionTimeout(); // Reset timeout on activity
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
        setupSessionTimeout(); // Reset timeout on activity
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
        setupSessionTimeout(); // Reset timeout on activity
    } catch (error) {
        console.error('Error calculating pending amount:', error);
    }
}

// Enhanced Import/Export Functions
function exportAllData() {
    try {
        showToast('Preparing export...', 'success');
        
        const data = {
            clinic: CLINIC_INFO.name,
            exportMetadata: {
                exportDate: new Date().toISOString(),
                totalPatients: patients.length,
                version: "2.0",
                clinicInfo: CLINIC_INFO
            },
            patients: patients
        };
        
        const filename = `dentartica-all-patients-${new Date().toISOString().split('T')[0]}.json`;
        downloadJSON(data, filename);
        showToast(`Successfully exported ${patients.length} patient records`, 'success');
        setupSessionTimeout(); // Reset timeout on activity
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
            clinic: CLINIC_INFO.name,
            exportMetadata: {
                exportDate: new Date().toISOString(),
                patientId: patient.id,
                patientName: patient.name,
                version: "2.0",
                clinicInfo: CLINIC_INFO
            },
            patient: patient
        };
        
        const filename = `dentartica-patient-${patient.id}-${patient.name.replace(/\s+/g, '-')}.json`;
        downloadJSON(data, filename);
        showToast('Patient data exported successfully', 'success');
        setupSessionTimeout(); // Reset timeout on activity
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

// Multiple File Import Functions
function importMultipleFiles() {
    try {
        // Show the import modal first
        showImportModal();
        resetImportModal();
    } catch (error) {
        console.error('Error importing multiple files:', error);
        showToast('Error opening import dialog', 'error');
    }
}

function resetImportModal() {
    try {
        const progressFill = document.getElementById('progressFill');
        const importStatus = document.getElementById('importStatus');
        const importDetails = document.getElementById('importDetails');
        const importCloseBtn = document.getElementById('importCloseBtn');
        
        if (progressFill) progressFill.style.width = '0%';
        if (importStatus) importStatus.textContent = 'Click "Select Files" to choose JSON files for import';
        if (importDetails) importDetails.innerHTML = '<p>Select multiple JSON files to import patient records. The system will handle duplicates automatically.</p>';
        if (importCloseBtn) importCloseBtn.style.display = 'none';
    } catch (error) {
        console.error('Error resetting import modal:', error);
    }
}

function selectFilesForImport() {
    try {
        const fileInput = document.getElementById('importMultipleFiles');
        if (fileInput) {
            fileInput.click();
        }
    } catch (error) {
        console.error('Error selecting files:', error);
        showToast('Error opening file selector', 'error');
    }
}

function handleMultipleFileImport(event) {
    const files = Array.from(event.target.files);
    if (!files.length) return;
    
    processMultipleFiles(files);
    event.target.value = ''; // Clear the input
}

function showImportModal() {
    const modal = document.getElementById('importModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeImportModal() {
    const modal = document.getElementById('importModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

async function processMultipleFiles(files) {
    const progressFill = document.getElementById('progressFill');
    const importStatus = document.getElementById('importStatus');
    const importDetails = document.getElementById('importDetails');
    const importCloseBtn = document.getElementById('importCloseBtn');
    
    let processedFiles = 0;
    let importedPatients = 0;
    let duplicateCount = 0;
    let errorCount = 0;
    const importResults = [];
    
    importStatus.textContent = `Processing ${files.length} files...`;
    importDetails.innerHTML = '';
    importCloseBtn.style.display = 'none';
    
    for (const file of files) {
        try {
            const result = await processImportFile(file);
            importResults.push(result);
            
            if (result.success) {
                if (result.isDuplicate) {
                    duplicateCount++;
                } else {
                    importedPatients++;
                }
            } else {
                errorCount++;
            }
            
            processedFiles++;
            const progress = (processedFiles / files.length) * 100;
            progressFill.style.width = `${progress}%`;
            
            // Update details
            updateImportDetails(importResults);
            
        } catch (error) {
            console.error('Error processing file:', file.name, error);
            importResults.push({
                fileName: file.name,
                success: false,
                error: error.message
            });
            errorCount++;
            processedFiles++;
        }
    }
    
    // Update counter if new patients were added
    if (importedPatients > 0 && patients.length > 0) {
        const maxId = Math.max(...patients.map(p => parseInt(p.id.replace('PA', ''))));
        patientCounter = maxId + 1;
    }
    
    // Save to storage and refresh view
    savePatientsToStorage();
    renderPatientList();
    
    // Final status update
    importStatus.innerHTML = `
        <strong>Import Complete!</strong><br>
        ${importedPatients} new patients imported<br>
        ${duplicateCount} duplicates updated<br>
        ${errorCount} files had errors
    `;
    
    importCloseBtn.style.display = 'inline-block';
    
    // Show final toast
    if (importedPatients > 0 || duplicateCount > 0) {
        showToast(`Import completed: ${importedPatients + duplicateCount} records processed`, 'success');
    } else if (errorCount > 0) {
        showToast('Import completed with errors. Check details.', 'error');
    }
    
    setupSessionTimeout();
}

function processImportFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                let patientsToImport = [];
                
                // Handle different file formats
                if (data.patients && Array.isArray(data.patients)) {
                    // Multiple patients file
                    patientsToImport = data.patients;
                } else if (data.patient) {
                    // Single patient file
                    patientsToImport = [data.patient];
                } else {
                    // Try to treat the whole file as a patient record
                    if (data.id && data.name) {
                        patientsToImport = [data];
                    }
                }
                
                if (patientsToImport.length === 0) {
                    resolve({
                        fileName: file.name,
                        success: false,
                        error: 'No valid patient data found'
                    });
                    return;
                }
                
                let importedCount = 0;
                let duplicateCount = 0;
                
                patientsToImport.forEach(importedPatient => {
                    if (!importedPatient.id || !importedPatient.name) {
                        return; // Skip invalid records
                    }
                    
                    const existingIndex = patients.findIndex(p => p.id === importedPatient.id);
                    if (existingIndex !== -1) {
                        // Update existing patient
                        patients[existingIndex] = {
                            ...importedPatient,
                            updatedAt: new Date().toISOString()
                        };
                        duplicateCount++;
                    } else {
                        // Add new patient
                        patients.push({
                            ...importedPatient,
                            createdAt: importedPatient.createdAt || new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        });
                        importedCount++;
                    }
                });
                
                resolve({
                    fileName: file.name,
                    success: true,
                    importedCount,
                    duplicateCount,
                    isDuplicate: duplicateCount > 0 && importedCount === 0
                });
                
            } catch (error) {
                resolve({
                    fileName: file.name,
                    success: false,
                    error: 'Invalid JSON format'
                });
            }
        };
        
        reader.onerror = function() {
            resolve({
                fileName: file.name,
                success: false,
                error: 'Failed to read file'
            });
        };
        
        reader.readAsText(file);
    });
}

function updateImportDetails(results) {
    const importDetails = document.getElementById('importDetails');
    
    importDetails.innerHTML = results.map(result => `
        <div class="import-item">
            <span>${result.fileName}</span>
            <span class="import-status ${result.success ? (result.isDuplicate ? 'duplicate' : 'success') : 'error'}">
                ${result.success 
                    ? (result.isDuplicate ? 'Updated' : `Imported (${result.importedCount || 0})`)
                    : 'Error: ' + result.error
                }
            </span>
        </div>
    `).join('');
}

// Legacy single file import (kept for backward compatibility)
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
    const files = Array.from(event.target.files);
    if (files.length === 1) {
        // Single file import
        const file = files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.patients && Array.isArray(data.patients)) {
                    // Import all patients
                    const importedCount = data.patients.length;
                    let updatedCount = 0;
                    let newCount = 0;
                    
                    data.patients.forEach(importedPatient => {
                        const existingIndex = patients.findIndex(p => p.id === importedPatient.id);
                        if (existingIndex !== -1) {
                            patients[existingIndex] = importedPatient;
                            updatedCount++;
                        } else {
                            patients.push(importedPatient);
                            newCount++;
                        }
                    });
                    
                    // Update counter
                    if (patients.length > 0) {
                        const maxId = Math.max(...patients.map(p => parseInt(p.id.replace('PA', ''))));
                        patientCounter = maxId + 1;
                    }
                    
                    savePatientsToStorage();
                    renderPatientList();
                    showToast(`Successfully imported ${newCount} new records, updated ${updatedCount}`, 'success');
                } else if (data.patient) {
                    // Import single patient
                    const existingIndex = patients.findIndex(p => p.id === data.patient.id);
                    if (existingIndex !== -1) {
                        patients[existingIndex] = data.patient;
                        showToast('Patient record updated successfully', 'success');
                    } else {
                        patients.push(data.patient);
                        showToast('Patient record imported successfully', 'success');
                    }
                    
                    savePatientsToStorage();
                    renderPatientList();
                } else {
                    showToast('Invalid file format', 'error');
                }
                
                setupSessionTimeout();
            } catch (error) {
                console.error('Error importing file:', error);
                showToast('Error importing file: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    }
    
    event.target.value = ''; // Clear the input
}

// Enhanced Print Functions
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
        setupSessionTimeout();
        
        // Small delay to ensure the content is rendered
        setTimeout(() => {
            window.print();
        }, 100);
    } catch (error) {
        console.error('Error printing patient record:', error);
        showToast('Error printing record', 'error');
    }
}

function generatePrintView(patient) {
    try {
        const printView = document.getElementById('printView');
        if (!printView) return;
        
        // Generate dental chart for print
        const printDentalChart = generatePrintDentalChart(patient.teethConditions || {});
        
        printView.innerHTML = `
            <div class="print-content">
                <div class="print-header">
                    <h1>🦷 ${CLINIC_INFO.name}</h1>
                    <div class="clinic-info">
                    </div>
                    <hr>
                    <p><strong>Patient Report</strong></p>
                    <p>Patient ID: <strong>${patient.id}</strong> | Date: <strong>${new Date(patient.updatedAt).toLocaleDateString()}</strong></p>
                </div>
                
                <div class="print-section">
                    <h3>Patient Demographics</h3>
                    <div class="print-field"><span class="print-label">Name:</span><span class="print-value">${patient.name}</span></div>
                    <div class="print-field"><span class="print-label">Age:</span><span class="print-value">${patient.age} years</span></div>
                    <div class="print-field"><span class="print-label">Sex:</span><span class="print-value">${patient.sex}</span></div>
                    <div class="print-field"><span class="print-label">Phone:</span><span class="print-value">${patient.phone || 'Not provided'}</span></div>
                    <div class="print-field"><span class="print-label">Address:</span><span class="print-value">${patient.address || 'Not provided'}</span></div>
                    <div class="print-field"><span class="print-label">Occupation:</span><span class="print-value">${patient.occupation || 'Not provided'}</span></div>
                </div>
                
                <div class="print-section">
                    <h3>Chief Complaint & History</h3>
                    <div class="print-field"><span class="print-label">Chief Complaint:</span><span class="print-value">${patient.complaint || 'None recorded'}</span></div>
                    <div class="print-field"><span class="print-label">History of Present Illness:</span><span class="print-value">${patient.hopi || 'None recorded'}</span></div>
                    <div class="print-field"><span class="print-label">Pain Intensity:</span><span class="print-value">${patient.intensity || 'Not specified'}</span></div>
                    <div class="print-field"><span class="print-label">Pain Nature:</span><span class="print-value">${patient.nature || 'Not specified'}</span></div>
                    <div class="print-field"><span class="print-label">Aggravating Factors:</span><span class="print-value">${patient.aggravating || 'None recorded'}</span></div>
                    <div class="print-field"><span class="print-label">Relief Factors:</span><span class="print-value">${patient.relief || 'None recorded'}</span></div>
                </div>
                
                <div class="print-section">
                    <h3>Medical History (PMH)</h3>
                    <div class="print-field"><span class="print-label">Hypertension:</span><span class="print-value">${patient.hypertension ? 'Yes' : 'No'}</span></div>
                    <div class="print-field"><span class="print-label">Diabetes:</span><span class="print-value">${patient.diabetes ? 'Yes' : 'No'}</span></div>
                    <div class="print-field"><span class="print-label">Thyroid:</span><span class="print-value">${patient.thyroid ? 'Yes' : 'No'}</span></div>
                    <div class="print-field"><span class="print-label">Other Conditions:</span><span class="print-value">${patient.medicalOthers || 'None recorded'}</span></div>
                </div>

                <div class="print-section">
                    <h3>Dental History (POH)</h3>
                    <div class="print-field"><span class="print-label">Previous Extractions:</span><span class="print-value">${patient.prevExtractions ? 'Yes' : 'No'}</span></div>
                    <div class="print-field"><span class="print-label">Previous Restorations:</span><span class="print-value">${patient.prevRestorations ? 'Yes' : 'No'}</span></div>
                    <div class="print-field"><span class="print-label">Previous RCT:</span><span class="print-value">${patient.prevRCT ? 'Yes' : 'No'}</span></div>
                    <div class="print-field"><span class="print-label">Previous Orthodontic Treatment:</span><span class="print-value">${patient.prevOrtho ? 'Yes' : 'No'}</span></div>
                    <div class="print-field"><span class="print-label">Previous Prosthetic Treatment:</span><span class="print-value">${patient.prevProsth ? 'Yes' : 'No'}</span></div>
                    <div class="print-field"><span class="print-label">Other Dental History:</span><span class="print-value">${patient.dentalOthers || 'None recorded'}</span></div>
                </div>
                
                <div class="print-section">
                    <h3>Clinical Examination (OIE)</h3>
                    <div class="print-field"><span class="print-label">Impaction:</span><span class="print-value">${patient.impaction ? 'Present' : 'Absent'}</span></div>
                    <div class="print-field"><span class="print-label">OPC:</span><span class="print-value">${patient.opc ? 'Present' : 'Absent'}</span></div>
                    <div class="print-field"><span class="print-label">Abscess:</span><span class="print-value">${patient.abscess ? 'Present' : 'Absent'}</span></div>
                    <div class="print-field"><span class="print-label">RCT Needed:</span><span class="print-value">${patient.rctNeeded ? 'Yes' : 'No'}</span></div>
                    <div class="print-field"><span class="print-label">Crown Needed:</span><span class="print-value">${patient.crownNeeded ? 'Yes' : 'No'}</span></div>
                    <div class="print-field"><span class="print-label">Tooth Mobility:</span><span class="print-value">${patient.mobility ? 'Present' : 'Absent'}</span></div>
                    <div class="print-field"><span class="print-label">Cervical Dentin:</span><span class="print-value">${patient.cervicalDentin ? 'Present' : 'Absent'}</span></div>
                    <div class="print-field"><span class="print-label">Gingival Recession:</span><span class="print-value">${patient.gingivalRecession ? 'Present' : 'Absent'}</span></div>
                    <div class="print-field"><span class="print-label">Affected Tooth Numbers:</span><span class="print-value">${patient.toothNumbers || 'None specified'}</span></div>
                    <div class="print-field"><span class="print-label">Other Findings:</span><span class="print-value">${patient.clinicalOthers || 'None recorded'}</span></div>
                </div>

                ${printDentalChart}
                
                <div class="print-section">
                    <h3>Treatment Plan</h3>
                    <div class="print-field"><span class="print-label">GIC Restoration:</span><span class="print-value">${patient.gic ? 'Required' : 'Not required'}</span></div>
                    <div class="print-field"><span class="print-label">Composite Filling:</span><span class="print-value">${patient.composite ? 'Required' : 'Not required'}</span></div>
                    <div class="print-field"><span class="print-label">Crown:</span><span class="print-value">${patient.treatmentCrown ? 'Required' : 'Not required'}</span></div>
                    <div class="print-field"><span class="print-label">Extraction:</span><span class="print-value">${patient.extraction ? 'Required' : 'Not required'}</span></div>
                    <div class="print-field"><span class="print-label">X-ray:</span><span class="print-value">${patient.xray ? 'Required' : 'Not required'}</span></div>
                    <div class="print-field"><span class="print-label">Root Canal Treatment:</span><span class="print-value">${patient.treatmentRCT ? 'Required' : 'Not required'}</span></div>
                    <div class="print-field"><span class="print-label">Orthodontic Treatment:</span><span class="print-value">${patient.treatmentOrtho ? 'Required' : 'Not required'}</span></div>
                    <div class="print-field"><span class="print-label">Other Treatments:</span><span class="print-value">${patient.treatmentOthers || 'None planned'}</span></div>
                </div>

                <div class="print-section">
                    <h3>Prescription</h3>
                    <div class="print-field"><span class="print-label">Amoxicillin-Clavulanate:</span><span class="print-value">${patient.amoxClav ? 'Prescribed' : 'Not prescribed'}</span></div>
                    <div class="print-field"><span class="print-label">Paracetamol:</span><span class="print-value">${patient.paracetamol ? 'Prescribed' : 'Not prescribed'}</span></div>
                    <div class="print-field"><span class="print-label">Zerodol-P:</span><span class="print-value">${patient.zerodolP ? 'Prescribed' : 'Not prescribed'}</span></div>
                    <div class="print-field"><span class="print-label">Hifinac:</span><span class="print-value">${patient.hifinac ? 'Prescribed' : 'Not prescribed'}</span></div>
                    <div class="print-field"><span class="print-label">Flagyl:</span><span class="print-value">${patient.flagyl ? 'Prescribed' : 'Not prescribed'}</span></div>
                    <div class="print-field"><span class="print-label">Pan:</span><span class="print-value">${patient.pan ? 'Prescribed' : 'Not prescribed'}</span></div>
                    <div class="print-field"><span class="print-label">Other Medications:</span><span class="print-value">${patient.prescriptionOthers || 'None prescribed'}</span></div>
                </div>
                
                <div class="print-section">
                    <h3>Payment Details</h3>
                    <div class="print-field"><span class="print-label">Total Amount:</span><span class="print-value">₹${patient.total || 0}</span></div>
                    <div class="print-field"><span class="print-label">Amount Paid:</span><span class="print-value">₹${patient.paid || 0}</span></div>
                    <div class="print-field"><span class="print-label">Amount Pending:</span><span class="print-value">₹${patient.pending || 0}</span></div>
                    <div class="print-field"><span class="print-label">Payment Method:</span><span class="print-value">${patient.paymentMethod || 'Not specified'}</span></div>
                    <div class="print-field"><span class="print-label">Additional Expenses:</span><span class="print-value">₹${patient.expenses || 0}</span></div>
                </div>
                
                <div class="print-section">
                    <h3>Visit Information</h3>
                    <div class="print-field"><span class="print-label">Consultant:</span><span class="print-value">${patient.consultant || 'Not specified'}</span></div>
                    <div class="print-field"><span class="print-label">New Patient:</span><span class="print-value">${patient.newPatient ? 'Yes' : 'No'}</span></div>
                    <div class="print-field"><span class="print-label">Home Visit:</span><span class="print-value">${patient.homeVisit ? 'Yes' : 'No'}</span></div>
                    <div class="print-field"><span class="print-label">Appointment:</span><span class="print-value">${patient.appointment ? new Date(patient.appointment).toLocaleString() : 'Not scheduled'}</span></div>
                    <div class="print-field"><span class="print-label">Record Created:</span><span class="print-value">${new Date(patient.createdAt).toLocaleDateString()}</span></div>
                    <div class="print-field"><span class="print-label">Last Updated:</span><span class="print-value">${new Date(patient.updatedAt).toLocaleDateString()}</span></div>
                </div>

                <div class="print-footer">
                    <p><strong>${CLINIC_INFO.name}</strong></p>
                    <p>This is a computer-generated report. For any queries, contact ${CLINIC_INFO.phone}</p>
                    <p><small>Report generated on ${new Date().toLocaleString()}</small></p>
                </div>
            </div>
        `;
        
        // Show print view temporarily for printing
        document.getElementById('patientFormView').classList.add('hidden');
        printView.classList.remove('hidden');
        
        // Hide print view after printing
        setTimeout(() => {
            printView.classList.add('hidden');
            document.getElementById('patientFormView').classList.remove('hidden');
        }, 1000);
        
    } catch (error) {
        console.error('Error generating print view:', error);
    }
}

function generatePrintDentalChart(teethConditions) {
    try {
        const upperRow = upperTeeth.map(toothNum => {
            const condition = teethConditions[toothNum] || 'healthy';
            return `<div class="print-tooth ${condition}">${toothNum}</div>`;
        }).join('');
        
        const lowerRow = lowerTeeth.map(toothNum => {
            const condition = teethConditions[toothNum] || 'healthy';
            return `<div class="print-tooth ${condition}">${toothNum}</div>`;
        }).join('');
        
        return `
            <div class="print-section">
                <h3>Dental Chart</h3>
                <div class="print-dental-chart">
                    <p><strong>Upper Jaw:</strong></p>
                    <div class="print-teeth-row">${upperRow}</div>
                    <p><strong>Lower Jaw:</strong></p>
                    <div class="print-teeth-row">${lowerRow}</div>
                    <p><small>Legend: White=Healthy, Light Red=Decay, Light Blue=Filled, Light Yellow=Crown, Gray=Extracted, Orange=RCT, Purple=Impacted</small></p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error generating print dental chart:', error);
        return '<div class="print-section"><h3>Dental Chart</h3><p>Chart data unavailable</p></div>';
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