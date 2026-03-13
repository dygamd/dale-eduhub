// ==================== SUPABASE CONFIG ====================
const SUPABASE_CONFIG = {
    url: 'https://ktfhmqvuhqlzhkotorsi.supabase.co',
    // Gunakan anon key anda yang sedia ada
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmhtcXZ1aHFsemhrb3RvcnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTE2OTI2MTAsImV4cCI6MjAyNzI2ODYxMH0.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmhtcXZ1aHFsemhrb3RvcnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTY3NTQsImV4cCI6MjA4ODgzMjc1NH0.yIqlOSSz_40EuFJV2DaLMIaD5Ou6A9ycMQMAxrMohyA'
};

// Initialize Supabase
const supabase = window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.key
);

// ==================== LOAD TESTIMONIALS ====================
async function loadTestimonials() {
    const loading = document.getElementById('testimoniLoading');
    const swiperContainer = document.getElementById('testimoniSwiper');
    const wrapper = document.getElementById('testimoniWrapper');
    const debugDiv = document.getElementById('testimoniDebug');
    
    try {
        // Ambil data dari View public_testimonials (lebih selamat)
        // Jika View belum dibuat, tukar 'public_testimonials' kepada 'testimonials'
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('active', true)
            .order('id', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
            wrapper.innerHTML = '';
            
            data.forEach((t) => {
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
            
            // Sembunyikan loading & tunjuk container
            if (loading) loading.style.display = 'none';
            if (swiperContainer) swiperContainer.style.display = 'block';

            // INITIALIZE SWIPER
            new Swiper('.mySwiper', {
                slidesPerView: 1,
                spaceBetween: 20,
                loop: data.length > 1, // Hanya loop jika ada lebih dari 1 data
                observer: true,         // PENTING: Untuk detect perubahan display:none
                observeParents: true,   // PENTING
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                breakpoints: {
                    640: { slidesPerView: 2, spaceBetween: 30 },
                    1024: { slidesPerView: 3, spaceBetween: 30 }
                }
            });
            
        } else {
            // Jika tiada data
            if (loading) loading.style.display = 'none';
            if (swiperContainer) swiperContainer.style.display = 'block';
            wrapper.innerHTML = '<div class="swiper-slide"><div class="testi-card">Tiada testimoni buat masa ini.</div></div>';
        }
        
    } catch (err) {
        console.error('❌ Error loading testimonials:', err);
        if (loading) loading.style.display = 'none';
        if (debugDiv) {
            debugDiv.style.display = 'block';
            debugDiv.innerHTML = `Ralat: ${err.message}. Pastikan table 'testimonials' wujud & RLS aktif.`;
        }
    }
}

// ==================== WHATSAPP FORM ====================
document.getElementById('whatsappForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const formLoading = document.getElementById('formLoading');
    const originalText = submitBtn.innerHTML;
    
    // Ambil data
    const formData = {
        name: document.getElementById('stuName').value,
        parent_name: document.getElementById('parentName').value,
        parent_phone: document.getElementById('parentPhone').value,
        parent_email: document.getElementById('parentEmail').value,
        student_level: document.getElementById('stuLevel').value,
        subject: document.getElementById('stuSubject').value
    };

    const classType = document.getElementById('classType').value;
    const stuMsg = document.getElementById('stuMsg').value || 'Tiada catatan';

    // UI Loading
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
    submitBtn.disabled = true;
    if (formLoading) formLoading.style.display = 'block';
    
    try {
        // 1. Simpan ke Supabase
        const { error } = await supabase.from('students').insert([formData]);
        if (error) throw error;
        
        // 2. Format WhatsApp message
        const waText = `*PENDAFTARAN KELAS DALe EduHub*%0A%0A` +
            `Nama Pelajar: ${formData.name}%0A` +
            `Tingkatan: ${formData.student_level}%0A` +
            `Subjek: ${formData.subject}%0A` +
            `Jenis Kelas: ${classType}%0A` +
            `Nama Ibu/Bapa: ${formData.parent_name}%0A` +
            `Telefon: ${formData.parent_phone}%0A` +
            `Catatan: ${stuMsg}`;
        
        // 3. Open WhatsApp
        window.open(`https://wa.me/60128258869?text=${waText}`, '_blank');
        
        // Success notification
        showToast('Pendaftaran berjaya!', 'success');
        this.reset();
        
    } catch (err) {
        console.error('❌ Form error:', err);
        alert(`Gagal: ${err.message}`);
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        if (formLoading) formLoading.style.display = 'none';
    }
});

// ==================== UTILITIES (Toast & Mobile Menu) ====================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return alert(message);
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
}

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
    loadTestimonials();
});
