// ==================== SUPABASE CONFIG ====================
const SUPABASE_URL = 'https://ktfhmqvuhqlzhkotorsi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kOz2lNp6289X7bajR5qmTw_Q1_Vh1zf';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==================== PAGE NAVIGATION ====================
let mobileMenuOpen = false;

function showPage(pageName) {
    console.log('Navigating to:', pageName);
    
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageName + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    
    const navId = 'nav-' + pageName;
    const activeNav = document.getElementById(navId);
    if (activeNav) {
        activeNav.classList.add('active');
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (mobileMenuOpen) toggleMobileMenu();
}

function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    mobileMenuOpen = !mobileMenuOpen;
    navLinks.style.display = mobileMenuOpen ? 'flex' : '';
}

// ==================== LOAD TESTIMONIALS - VERSION MUDAH ====================
async function loadTestimonials() {
    console.log('Loading testimonials...');
    
    const loading = document.getElementById('testimoniLoading');
    const swiper = document.getElementById('testimoniSwiper');
    const wrapper = document.getElementById('testimoniWrapper');
    
    // Dummy data - terus guna ni dulu
    const testimonials = [
        {
            name: "Cik Syuhada",
            subject: "Matematik (Menengah Atas)",
            message: "Kelas dengan cikgu Dayang sangat okay. Cikgu tak berat mulut untuk ulang semula kalau saya tak faham."
        },
        {
            name: "Encik Azimy",
            subject: "Sains Komputer",
            message: "Anak saya okay dan faham dengan kelas cikgu Dayang."
        },
        {
            name: "Puan Basyirah",
            subject: "Matematik (Menengah Rendah)",
            message: "Terima kasih cikgu Dayang kerana sangat sabar."
        },
        {
            name: "Puan Aiza",
            subject: "Bahasa Jepun",
            message: "Alhamdulillah sangat mudah berurusan dengan cikgu."
        },
        {
            name: "Encik Khalid",
            subject: "Sains Komputer",
            message: "Tutor baik dan sangat knowledgable. Highly recommended!"
        }
    ];
    
    // Clear wrapper
    wrapper.innerHTML = '';
    
    // Add testimonials to wrapper
    testimonials.forEach(t => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.innerHTML = `
            <div class="testi-card">
                <div class="testi-text">"${t.message}"</div>
                <span class="testi-name">${t.name}</span>
                <span class="testi-subject">${t.subject}</span>
            </div>
        `;
        wrapper.appendChild(slide);
    });
    
    // Hide loading, show swiper
    loading.style.display = 'none';
    swiper.style.display = 'block';
    
    // Initialize Swiper
    new Swiper(".mySwiper", {
        slidesPerView: 1,
        spaceBetween: 15,
        loop: true,
        autoplay: { delay: 4000 },
        pagination: { el: ".swiper-pagination", clickable: true },
        breakpoints: {
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
        }
    });
}

// ==================== FORM SUBMISSION ====================
document.getElementById('whatsappForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const formLoading = document.getElementById('formLoading');
    const form = document.getElementById('whatsappForm');
    
    submitBtn.disabled = true;
    form.style.display = 'none';
    formLoading.style.display = 'block';
    
    const formData = {
        parentName: document.getElementById('parentName').value,
        studentName: document.getElementById('stuName').value,
        parentEmail: document.getElementById('parentEmail').value,
        parentPhone: document.getElementById('parentPhone').value,
        level: document.getElementById('stuLevel').value,
        classType: document.getElementById('classType').value,
        subject: document.getElementById('stuSubject').value,
        message: document.getElementById('stuMsg').value
    };

    try {
        // Try save to Supabase
        await supabase.from('students').insert([{
            name: formData.studentName,
            parent_name: formData.parentName || '',
            parent_email: formData.parentEmail,
            parent_phone: formData.parentPhone,
            student_level: formData.level,
            subject: formData.subject
        }]);

        // WhatsApp
        const parentInfo = formData.parentName ? `• Nama Ibu/Bapa: ${formData.parentName}\n` : '';
        const waText = `Salam Cikgu Dayang, saya berminat untuk mendaftar di *DALe EduHub*.\n\n` +
                     `*Butiran Pendaftaran:*\n` + parentInfo +
                     `• Nama Pelajar: ${formData.studentName}\n` +
                     `• Emel: ${formData.parentEmail}\n` +
                     `• No Telefon: ${formData.parentPhone}\n` +
                     `• Tingkatan: ${formData.level}\n` +
                     `• Jenis Kelas: ${formData.classType}\n` +
                     `• Subjek: ${formData.subject}\n` +
                     `• Mesej: ${formData.message || "Tiada"}`;

        window.open(`https://wa.me/60128258869?text=${encodeURIComponent(waText)}`, '_blank');
        
        const toast = document.getElementById('toast');
        toast.className = 'toast success show';
        document.getElementById('toastMessage').textContent = 'Pendaftaran berjaya!';
        setTimeout(() => toast.classList.remove('show'), 3000);
        
        form.reset();
    } catch (error) {
        console.error(error);
        const toast = document.getElementById('toast');
        toast.className = 'toast error show';
        document.getElementById('toastMessage').textContent = 'Ralat berlaku';
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
    
    submitBtn.disabled = false;
    form.style.display = 'block';
    formLoading.style.display = 'none';
});

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded');
    loadTestimonials();
    
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && mobileMenuOpen) toggleMobileMenu();
    });
});
