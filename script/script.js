// ==================== SUPABASE CONFIG ====================
// Ganti dengan anon key yang betul dari dashboard
// CARA DAPAT: Supabase Dashboard -> Project Settings -> API -> anon public
const SUPABASE_CONFIG = {
    url: 'https://ktfhmqvuhqlzhkotorsi.supabase.co',
    // 🔴 TOLONG TUKAR KEY INI dengan anon key dari dashboard awak
    key:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmhtcXZ1aHFsemhrb3RvcnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTE2OTI2MTAsImV4cCI6MjAyNzI2ODYxMH0.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmhtcXZ1aHFsemhrb3RvcnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTY3NTQsImV4cCI6MjA4ODgzMjc1NH0.yIqlOSSz_40EuFJV2DaLMIaD5Ou6A9ycMQMAxrMohyA'
};

// Debug: Check config
console.log('🚀 Initializing Supabase with URL:', SUPABASE_CONFIG.url);

// Initialize Supabase
const supabase = window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.key
);

// ==================== DEBUG FUNCTIONS ====================
function showDebug(message, type = 'error') {
    console.log(`🔍 Debug [${type}]:`, message);
    const debugDiv = document.getElementById('testimoniDebug');
    if (debugDiv) {
        debugDiv.style.display = 'block';
        debugDiv.innerHTML = `<strong>Debug:</strong> ${message}`;
        debugDiv.className = `debug-error ${type}`;
    }
}

// ==================== TEST CONNECTION ====================
async function testConnection() {
    try {
        console.log('🔄 Testing Supabase connection...');
        
        // Test 1: Basic connection
        const { data, error } = await supabase
            .from('testimonials')
            .select('count', { count: 'exact', head: true });
        
        if (error) {
            console.error('❌ Connection test failed:', error);
            showDebug(`Connection failed: ${error.message}`);
            return false;
        }
        
        console.log('✅ Connection successful!');
        return true;
        
    } catch (err) {
        console.error('❌ Connection test error:', err);
        showDebug(`Connection error: ${err.message}`);
        return false;
    }
}

// ==================== LOAD TESTIMONIALS WITH SWIPER ====================
async function loadTestimonials() {
    console.log('🔄 Loading testimonials...');
    
    const loading = document.getElementById('testimoniLoading');
    const swiperContainer = document.getElementById('testimoniSwiper');
    const wrapper = document.getElementById('testimoniWrapper');
    const debugDiv = document.getElementById('testimoniDebug');
    
    // Debug: Check if elements exist
    console.log('📦 DOM Elements:', {
        loading: !!loading,
        swiperContainer: !!swiperContainer,
        wrapper: !!wrapper,
        debugDiv: !!debugDiv
    });
    
    if (!wrapper) {
        console.error('❌ Testimoni wrapper not found!');
        if (debugDiv) {
            debugDiv.style.display = 'block';
            debugDiv.innerHTML = 'Error: Testimoni wrapper tidak dijumpai. HTML mungkin rosak.';
        }
        return;
    }
    
    try {
        // Test connection first
        const connected = await testConnection();
        if (!connected) {
            throw new Error('Cannot connect to Supabase');
        }
        
        // Query testimonials
        console.log('📡 Fetching testimonials from Supabase...');
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('active', true)
            .order('id', { ascending: false });

        if (error) {
            console.error('❌ Supabase query error:', error);
            throw error;
        }

        console.log('📊 Query result:', { data, error });

        if (data && data.length > 0) {
            console.log(`✅ Got ${data.length} testimonials:`, data);
            
            // Clear wrapper
            wrapper.innerHTML = '';
            
            // Add testimonials to wrapper
            data.forEach((t, index) => {
                console.log(`📝 Testimonial ${index + 1}:`, t.name);
                
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';
                slide.innerHTML = `
                    <div class="testi-card">
                        <div class="testi-text">"${t.message}"</div>
                        <div class="testi-name">${t.name}</div>
                        <div class="testi-subject">${t.subject}</div>
                    </div>
                `;
                wrapper.appendChild(slide);
            });
            
            // Hide loading, show swiper
            if (loading) loading.style.display = 'none';
            if (swiperContainer) {
                swiperContainer.style.display = 'block';
                
                // Initialize Swiper
                try {
                    const swiper = new Swiper('.mySwiper', {
                        slidesPerView: 1,
                        spaceBetween: 20,
                        loop: true,
                        autoplay: {
                            delay: 5000,
                            disableOnInteraction: false,
                        },
                        pagination: {
                            el: '.swiper-pagination',
                            clickable: true,
                        },
                        breakpoints: {
                            640: {
                                slidesPerView: 2,
                                spaceBetween: 30,
                            },
                            1024: {
                                slidesPerView: 3,
                                spaceBetween: 30,
                            }
                        }
                    });
                    console.log('✅ Swiper initialized');
                } catch (swiperError) {
                    console.error('❌ Swiper error:', swiperError);
                }
            }
            
            // Hide debug if visible
            if (debugDiv) debugDiv.style.display = 'none';
            
        } else {
            console.log('⚠️ No testimonials found');
            wrapper.innerHTML = '<div class="swiper-slide"><div class="testi-card">Tiada testimoni buat masa ini.</div></div>';
            if (loading) loading.style.display = 'none';
            if (swiperContainer) swiperContainer.style.display = 'block';
        }
        
    } catch (err) {
        console.error('❌ Fatal error loading testimonials:', err);
        
        // Show error in debug div
        if (debugDiv) {
            debugDiv.style.display = 'block';
            debugDiv.innerHTML = `
                <strong>Error loading testimonials:</strong><br>
                ${err.message}<br><br>
                <strong>Troubleshooting:</strong><br>
                1. Check Supabase URL and key<br>
                2. Make sure table 'testimonials' exists<br>
                3. Check if RLS policies allow SELECT
            `;
        }
        
        // Show error message in swiper
        if (wrapper) {
            wrapper.innerHTML = '<div class="swiper-slide"><div class="testi-card">Gagal memuatkan testimoni. Sila cuba sebentar lagi.</div></div>';
        }
        
        if (loading) loading.style.display = 'none';
        if (swiperContainer) swiperContainer.style.display = 'block';
    }
}

// ==================== WHATSAPP FORM ====================
document.getElementById('whatsappForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    console.log('📝 Form submitted');
    
    // Get elements
    const submitBtn = document.getElementById('submitBtn');
    const formLoading = document.getElementById('formLoading');
    const originalText = submitBtn ? submitBtn.innerHTML : 'Hantar';
    
    // Get form values
    const parentName = document.getElementById('parentName')?.value || '';
    const stuName = document.getElementById('stuName')?.value;
    const parentEmail = document.getElementById('parentEmail')?.value;
    const parentPhone = document.getElementById('parentPhone')?.value;
    const stuLevel = document.getElementById('stuLevel')?.value;
    const classType = document.getElementById('classType')?.value;
    const stuSubject = document.getElementById('stuSubject')?.value;
    const stuMsg = document.getElementById('stuMsg')?.value || '';
    
    console.log('📋 Form data:', {
        parentName, stuName, parentEmail, parentPhone, stuLevel, classType, stuSubject
    });
    
    // Validate required fields
    if (!stuName || !parentEmail || !parentPhone || !stuLevel || !classType || !stuSubject) {
        alert('Sila lengkapkan semua ruangan wajib');
        return;
    }
    
    // Show loading
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
        submitBtn.disabled = true;
    }
    if (formLoading) formLoading.style.display = 'block';
    
    try {
        // Test connection first
        const connected = await testConnection();
        if (!connected) {
            throw new Error('Cannot connect to database');
        }
        
        // Save to Supabase
        console.log('💾 Saving to Supabase...');
        const { data, error } = await supabase
            .from('students')
            .insert([{
                name: stuName,
                parent_name: parentName,
                parent_phone: parentPhone,
                parent_email: parentEmail,
                student_level: stuLevel,
                subject: stuSubject
            }]);
        
        if (error) {
            console.error('❌ Supabase insert error:', error);
            throw error;
        }
        
        console.log('✅ Data saved to Supabase:', data);
        
        // Create WhatsApp message
        const waText = `*PENDAFTARAN KELAS DALe EduHub*%0A%0A` +
            `Nama Pelajar: ${stuName}%0A` +
            `Tingkatan: ${stuLevel}%0A` +
            `Subjek: ${stuSubject}%0A` +
            `Jenis Kelas: ${classType}%0A` +
            `Nama Ibu/Bapa: ${parentName}%0A` +
            `Email: ${parentEmail}%0A` +
            `Telefon: ${parentPhone}%0A` +
            `Catatan: ${stuMsg || 'Tiada catatan'}`;
        
        // Open WhatsApp
        const waUrl = `https://wa.me/60128258869?text=${waText}`;
        console.log('📱 Opening WhatsApp:', waUrl);
        window.open(waUrl, '_blank');
        
        // Show success
        showToast('Pendaftaran berjaya! Anda akan diredirect ke WhatsApp.', 'success');
        
        // Reset form
        this.reset();
        
    } catch (err) {
        console.error('❌ Form error:', err);
        alert(`Gagal menghantar pendaftaran: ${err.message}. Sila cuba lagi.`);
    } finally {
        // Reset button
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
        if (formLoading) formLoading.style.display = 'none';
    }
});

// ==================== TOAST FUNCTION ====================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    
    if (!toast) {
        alert(message);
        return;
    }
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==================== MOBILE MENU ====================
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        if (navLinks.style.display === 'flex') {
            navLinks.style.display = 'none';
        } else {
            navLinks.style.display = 'flex';
        }
    }
}

// ==================== CLOSE MOBILE MENU ON CLICK ====================
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            const navLinks = document.querySelector('.nav-links');
            if (navLinks) navLinks.style.display = 'none';
        }
    });
});

// ==================== CHECK SUPABASE SETUP ====================
async function checkSupabaseSetup() {
    console.log('🔧 Checking Supabase setup...');
    
    try {
        // Check if table exists
        const { data, error } = await supabase
            .from('testimonials')
            .select('id')
            .limit(1);
        
        if (error) {
            console.error('❌ Table check failed:', error);
            
            // Show error in debug
            const debugDiv = document.getElementById('testimoniDebug');
            if (debugDiv) {
                debugDiv.style.display = 'block';
                debugDiv.innerHTML = `
                    <strong>⚠️ Supabase Setup Required:</strong><br>
                    Table 'testimonials' not found or no access.<br><br>
                    <strong>Please run this SQL in Supabase SQL Editor:</strong><br>
                    <pre style="background:#f5f5f5; padding:10px; overflow:auto;">
CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO testimonials (name, role, subject, message) VALUES
('Cik Syuhada', 'Pelajar', 'Matematik', 'Kelas dengan cikgu Dayang sangat okay.'),
('Encik Azimy', 'Ibu Bapa', 'Sains Komputer', 'Anak saya faham dengan kelas cikgu Dayang.');
                    </pre>
                `;
            }
        } else {
            console.log('✅ Table exists');
        }
        
    } catch (err) {
        console.error('❌ Setup check error:', err);
    }
}

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Page loaded, initializing...');
    
    // Show connection info
    console.log('🔗 Supabase URL:', SUPABASE_CONFIG.url);
    console.log('🔑 Key length:', SUPABASE_CONFIG.key.length);
    
    // Run checks and load data
    checkSupabaseSetup();
    loadTestimonials();
    
    // Test connection every 30 seconds for debugging
    setInterval(testConnection, 30000);
});
