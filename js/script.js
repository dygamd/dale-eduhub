// ==================== SUPABASE CONFIG ====================
// Guna Publishable Key yang anda beri
const SUPABASE_URL = 'https://ktfhmqvuhqlzhkotorsi.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_kOz2lNp6289X7bajR5qmTw_Q1_Vh1zf';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// ==================== MOBILE MENU ====================
window.toggleMobileMenu = function() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks.style.display === 'flex') {
        navLinks.style.display = '';
    } else {
        navLinks.style.display = 'flex';
    }
};

// ==================== TOAST NOTIFICATION ====================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    toast.className = `toast ${type} show`;
    toastMessage.textContent = message;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==================== LOAD TESTIMONIALS FROM SUPABASE ====================
async function loadTestimonials() {
    console.log('Loading testimonials from Supabase...');
    
    const loading = document.getElementById('testimoniLoading');
    const swiper = document.getElementById('testimoniSwiper');
    const wrapper = document.getElementById('testimoniWrapper');
    
    if (!wrapper) return;
    
    try {
        // Try to fetch from Supabase - ambil yang active = true
        const { data: testimonials, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('active', true)
            .order('id', { ascending: true });

        if (error) {
            console.error('Supabase error:', error);
            showToast('Gagal memuatkan testimoni dari database', 'error');
            useDummyTestimonials();
            return;
        }

        if (testimonials && testimonials.length > 0) {
            console.log(`Loaded ${testimonials.length} testimonials from Supabase`);
            renderTestimonials(testimonials);
        } else {
            console.log('No testimonials in Supabase, using dummy data');
            useDummyTestimonials();
        }
    } catch (error) {
        console.error('Error loading testimonials:', error);
        useDummyTestimonials();
    }
}

function useDummyTestimonials() {
    const dummyTestimonials = [
        {
            name: "Cik Syuhada",
            role: "Pelajar",
            subject: "Matematik (Menengah Atas)",
            message: "Kelas dengan cikgu Dayang sangat okay. Cikgu tak berat mulut untuk ulang semula kalau saya tak faham. Cikgu pun ajar perlahan tak terlalu laju."
        },
        {
            name: "Encik Azimy",
            role: "Ibu Bapa",
            subject: "Sains Komputer",
            message: "Sebelum ini, anak lelaki saya pernah belajar dengan cikgu Dayang bagi kelas intensif sebelum SPM. Kali ini, anak perempuan saya pulak yang menjadi murid kepada cikgu Dayang. Alhamdulilah, kedua-dua anak saya okay dan faham dengan kelas cikgu Dayang."
        },
        {
            name: "Puan Basyirah",
            role: "Ibu Bapa",
            subject: "Matematik (Menengah Rendah)",
            message: "Terima kasih cikgu Dayang kerana sangat sabar dalam mengajar anak saya yang pendiam."
        },
        {
            name: "Puan Aiza",
            role: "Ibu Bapa",
            subject: "Bahasa Jepun",
            message: "Alhamdulillah sangat mudah berurusan dengan cikgu. Anak saya pun okay dan faham dengan apa yang cikgu ajar."
        }
    ];
    renderTestimonials(dummyTestimonials);
}

function renderTestimonials(testimonials) {
    const wrapper = document.getElementById('testimoniWrapper');
    const loading = document.getElementById('testimoniLoading');
    const swiper = document.getElementById('testimoniSwiper');
    
    if (!wrapper) return;
    
    wrapper.innerHTML = '';
    
    testimonials.forEach(t => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        // Gunakan message, name, subject (role tak dipaparkan)
        slide.innerHTML = `
            <div class="testi-card">
                <div class="testi-text">"${t.message}"</div>
                <span class="testi-name">${t.name}</span>
                <span class="testi-subject">${t.subject}</span>
            </div>
        `;
        wrapper.appendChild(slide);
    });
    
    loading.style.display = 'none';
    swiper.style.display = 'block';
    
    // Initialize Swiper
    new Swiper(".mySwiper", {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        breakpoints: {
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
        }
    });
}

// ==================== FORM SUBMISSION ====================
window.submitForm = async function() {
    console.log('Submit button clicked');
    
    // Get form values
    const parentName = document.getElementById('parentName').value;
    const studentName = document.getElementById('stuName').value;
    const parentEmail = document.getElementById('parentEmail').value;
    const parentPhone = document.getElementById('parentPhone').value;
    const level = document.getElementById('stuLevel').value;
    const classType = document.getElementById('classType').value;
    const subject = document.getElementById('stuSubject').value;
    const message = document.getElementById('stuMsg').value;

    // Validate required fields
    if (!studentName || !parentEmail || !parentPhone || !level || !classType || !subject) {
        alert('Sila lengkapkan semua medan wajib (*)');
        return;
    }
    
    // Show loading
    const submitBtn = document.getElementById('submitBtn');
    const formLoading = document.getElementById('formLoading');
    const form = document.getElementById('whatsappForm');
    
    submitBtn.disabled = true;
    form.style.display = 'none';
    formLoading.style.display = 'block';
    
    // Prepare WhatsApp message
    const parentInfo = parentName ? `• Nama Ibu/Bapa: ${parentName}\n` : '';
    const waText = `Salam Cikgu Dayang, saya berminat untuk mendaftar di *DALe EduHub*.\n\n` +
                 `*Butiran Pendaftaran:*\n` + parentInfo +
                 `• Nama Pelajar: ${studentName}\n` +
                 `• Emel: ${parentEmail}\n` +
                 `• No Telefon: ${parentPhone}\n` +
                 `• Tingkatan: ${level}\n` +
                 `• Jenis Kelas: ${classType}\n` +
                 `• Subjek: ${subject}\n` +
                 `• Mesej: ${message || "Tiada"}`;

    try {
        // Save to Supabase with publishable key
        const { data, error } = await supabase.from('students').insert([{
            name: studentName,
            parent_name: parentName || '',
            parent_email: parentEmail,
            parent_phone: parentPhone,
            student_level: level,
            subject: subject
        }]);
        
        if (error) {
            console.error('Supabase insert error:', error);
            // Still continue to WhatsApp
        } else {
            console.log('Saved to Supabase:', data);
        }
    } catch (error) {
        console.error('Error saving to Supabase:', error);
        // Continue to WhatsApp even if Supabase fails
    }
    
    // Open WhatsApp - ensure URL is correct
    const whatsappUrl = `https://wa.me/60128258869?text=${encodeURIComponent(waText)}`;
    window.open(whatsappUrl, '_blank');
    
    showToast('Pendaftaran dihantar! WhatsApp akan terbuka.', 'success');
    
    // Reset form
    form.reset();
    
    // Hide loading
    submitBtn.disabled = false;
    form.style.display = 'block';
    formLoading.style.display = 'none';
};

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    // Load testimonials from Supabase
    loadTestimonials();
});
