// ==================== KONFIGURASI SUPABASE ====================
const SB_URL = 'https://ktfhmqvuhqlzhkotorsi.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmhtcXZ1aHFsemhrb3RvcnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTY3NTQsImV4cCI6MjA4ODgzMjc1NH0.yIqlOSSz_40EuFJV2DaLMIaD5Ou6A9ycMQMAxrMohyA';

// Initialize Supabase
const supabase = window.supabase.createClient(SB_URL, SB_KEY.trim());

// ==================== ELEMENTS REFERENCE ====================
const elements = {
    testimoniWrapper: document.getElementById('testimoniWrapper'),
    testimoniLoading: document.getElementById('testimoniLoading'),
    testimoniSwiper: document.getElementById('testimoniSwiper'),
    whatsappForm: document.getElementById('whatsappForm'),
    submitBtn: document.getElementById('submitBtn'),
    toast: document.getElementById('toast')
};

// ==================== TOAST NOTIFICATION ====================
function showToast(message, type = 'success', duration = 3000) {
    const toast = elements.toast;
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// ==================== LOAD TESTIMONIALS ====================
async function loadTestimonials() {
    const { testimoniWrapper, testimoniLoading, testimoniSwiper } = elements;
    
    if (!testimoniWrapper) return;

    try {
        // Show loading
        if (testimoniLoading) testimoniLoading.style.display = 'block';
        if (testimoniSwiper) testimoniSwiper.style.display = 'none';

        // Fetch testimonials from Supabase
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('active', true)
            .order('id', { ascending: false });

        if (error) throw error;

        // Hide loading
        if (testimoniLoading) testimoniLoading.style.display = 'none';

        if (data && data.length > 0) {
            // Build HTML for testimonials
            let html = '';
            data.forEach(t => {
                html += `
                <div class="swiper-slide">
                    <div class="testi-card">
                        <div class="testi-text">"${t.message}"</div>
                        <div class="testi-name">${t.name}</div>
                        <div class="testi-subject">${t.subject}</div>
                    </div>
                </div>`;
            });
            
            testimoniWrapper.innerHTML = html;
            if (testimoniSwiper) testimoniSwiper.style.display = 'block';

            // Initialize Swiper
            new Swiper('.mySwiper', {
                slidesPerView: 1,
                spaceBetween: 20,
                loop: data.length > 1,
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: false,
                },
                pagination: { 
                    el: '.swiper-pagination', 
                    clickable: true 
                },
                breakpoints: {
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 }
                }
            });
        } else {
            testimoniWrapper.innerHTML = `
                <div class="swiper-slide">
                    <div class="testi-card">
                        <div class="testi-text">Tiada testimoni buat masa ini.</div>
                    </div>
                </div>`;
            if (testimoniSwiper) testimoniSwiper.style.display = 'block';
        }
    } catch (err) {
        console.error('Error loading testimonials:', err);
        
        if (testimoniLoading) testimoniLoading.style.display = 'none';
        if (testimoniWrapper) {
            testimoniWrapper.innerHTML = `
                <div class="swiper-slide">
                    <div class="testi-card">
                        <div class="testi-text">Gagal memuatkan testimoni. Sila cuba sebentar lagi.</div>
                    </div>
                </div>`;
        }
        if (testimoniSwiper) testimoniSwiper.style.display = 'block';
        
        showToast('Gagal memuatkan testimoni', 'error');
    }
}

// ==================== WHATSAPP FORM HANDLER ====================
if (elements.whatsappForm) {
    elements.whatsappForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const btn = elements.submitBtn;
        const originalText = btn.innerHTML;

        try {
            // Disable button and show loading
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

            // Get form values
            const formData = {
                parentName: document.getElementById('parentName')?.value || '',
                stuName: document.getElementById('stuName')?.value,
                parentPhone: document.getElementById('parentPhone')?.value,
                parentEmail: document.getElementById('parentEmail')?.value,
                stuLevel: document.getElementById('stuLevel')?.value,
                stuSubject: document.getElementById('stuSubject')?.value,
                classType: document.getElementById('classType')?.value || 'Kelas Sebenar',
                stuMsg: document.getElementById('stuMsg')?.value || ''
            };

            // Validate required fields
            if (!formData.stuName || !formData.parentPhone || !formData.parentEmail || 
                !formData.stuLevel || !formData.stuSubject) {
                showToast('Sila lengkapkan semua ruangan wajib', 'error');
                btn.disabled = false;
                btn.innerHTML = originalText;
                return;
            }

            // Save to Supabase
            const { error: insertError } = await supabase
                .from('students')
                .insert([{
                    name: formData.stuName,
                    parent_name: formData.parentName,
                    parent_phone: formData.parentPhone,
                    parent_email: formData.parentEmail,
                    student_level: formData.stuLevel,
                    subject: formData.stuSubject
                }]);

            if (insertError) throw insertError;

            // Show success message
            showToast('Pendaftaran berjaya! Sedang redirect ke WhatsApp...', 'success');

            // Format WhatsApp message
            const waMsg = `*PENDAFTARAN DALE EDUHUB*%0A%0A` +
                `👤 *Nama Pelajar:* ${formData.stuName}%0A` +
                `📚 *Tingkatan:* ${formData.stuLevel}%0A` +
                `📖 *Subjek:* ${formData.stuSubject}%0A` +
                `🎯 *Jenis Kelas:* ${formData.classType}%0A` +
                `👪 *Ibu/Bapa:* ${formData.parentName || 'Tiada'}}%0A` +
                `📞 *Telefon:* ${formData.parentPhone}%0A` +
                `📧 *Email:* ${formData.parentEmail}%0A` +
                `📝 *Catatan:* ${formData.stuMsg || 'Tiada catatan'}`;
            
            // Redirect to WhatsApp after 1 second
            setTimeout(() => {
                window.open(`https://wa.me/60128258869?text=${waMsg}`, '_blank');
            }, 1000);

        } catch (err) {
            console.error('Form error:', err);
            showToast('Gagal mendaftar: ' + err.message, 'error');
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });
}

// ==================== MOBILE MENU ====================
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.classList.toggle('active');
    }
}

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks && window.innerWidth <= 768) {
            navLinks.classList.remove('active');
        }
    });
});

// ==================== SMOOTH SCROLL FOR ANCHOR LINKS ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==================== INITIALIZE ON PAGE LOAD ====================
document.addEventListener('DOMContentLoaded', function() {
    // Load testimonials
    loadTestimonials();

    // Add active class to current nav link
    const currentLocation = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === 'index.html' || link.getAttribute('href') === '/') {
            if (currentLocation === '/' || currentLocation.endsWith('index.html')) {
                link.classList.add('active');
            }
        }
    });
});
