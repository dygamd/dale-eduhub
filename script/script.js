// ==================== SUPABASE CONFIG ====================
const supabase = window.supabase.createClient(
    'https://ktfhmqvuhqlzhkotorsi.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmhtcXZ1aHFsemhrb3RvcnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTY3NTQsImV4cCI6MjA4ODgzMjc1NH0.yIqlOSSz_40EuFJV2DaLMIaD5Ou6A9ycMQMAxrMohyA'
);

// ==================== LOAD TESTIMONIALS WITH SWIPER ====================
async function loadTestimonials() {
    console.log('🔄 Loading testimonials...');
    
    const loading = document.getElementById('testimoniLoading');
    const swiperContainer = document.getElementById('testimoniSwiper');
    const wrapper = document.getElementById('testimoniWrapper');
    
    if (!wrapper) {
        console.error('❌ Testimoni wrapper not found!');
        return;
    }
    
    try {
        // Query testimonials from Supabase
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('active', true);

        if (error) {
            console.error('❌ Supabase error:', error);
            throw error;
        }

        if (data && data.length > 0) {
            console.log(`✅ Got ${data.length} testimonials:`, data);
            
            // Clear wrapper
            wrapper.innerHTML = '';
            
            // Add testimonials to wrapper
            data.forEach(t => {
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
            loading.style.display = 'none';
            swiperContainer.style.display = 'block';
            
            // Initialize Swiper
            new Swiper('.mySwiper', {
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
            
        } else {
            console.log('⚠️ No testimonials found');
            wrapper.innerHTML = '<div class="swiper-slide"><div class="testi-card">Tiada testimoni buat masa ini.</div></div>';
            loading.style.display = 'none';
            swiperContainer.style.display = 'block';
        }
    } catch (err) {
        console.error('❌ Error loading testimonials:', err);
        wrapper.innerHTML = '<div class="swiper-slide"><div class="testi-card">Gagal memuatkan testimoni.</div></div>';
        loading.style.display = 'none';
        swiperContainer.style.display = 'block';
    }
}

// ==================== WHATSAPP FORM ====================
document.getElementById('whatsappForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Show loading
    const submitBtn = document.getElementById('submitBtn');
    const formLoading = document.getElementById('formLoading');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
    submitBtn.disabled = true;
    if (formLoading) formLoading.style.display = 'block';
    
    // Get form values
    const parentName = document.getElementById('parentName')?.value || '';
    const stuName = document.getElementById('stuName')?.value;
    const parentEmail = document.getElementById('parentEmail')?.value;
    const parentPhone = document.getElementById('parentPhone')?.value;
    const stuLevel = document.getElementById('stuLevel')?.value;
    const classType = document.getElementById('classType')?.value;
    const stuSubject = document.getElementById('stuSubject')?.value;
    const stuMsg = document.getElementById('stuMsg')?.value || '';
    
    // Validate required fields
    if (!stuName || !parentEmail || !parentPhone || !stuLevel || !classType || !stuSubject) {
        showToast('Sila lengkapkan semua ruangan wajib', 'error');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        if (formLoading) formLoading.style.display = 'none';
        return;
    }
    
    try {
        // Save to Supabase
        const { error } = await supabase
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
        
        console.log('✅ Data saved to Supabase');
        
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
        window.open(`https://wa.me/60128258869?text=${waText}`, '_blank');
        
        // Show success
        showToast('Pendaftaran berjaya! Anda akan diredirect ke WhatsApp.', 'success');
        
        // Reset form
        this.reset();
        
    } catch (err) {
        console.error('❌ Error:', err);
        showToast('Gagal menghantar pendaftaran. Sila cuba lagi.', 'error');
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        if (formLoading) formLoading.style.display = 'none';
    }
});

// ==================== TOAST FUNCTION ====================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
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
        const navLinks = document.querySelector('.nav-links');
        if (window.innerWidth <= 768) {
            navLinks.style.display = 'none';
        }
    });
});

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Page loaded, initializing...');
    loadTestimonials();
});
