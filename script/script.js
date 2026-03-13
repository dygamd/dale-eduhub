// ==================== CONFIG ====================
const SB_URL = 'https://ktfhmqvuhqlzhkotorsi.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmhtcXZ1aHFsemhrb3RvcnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTE2OTI2MTAsImV4cCI6MjAyNzI2ODYxMH0.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmhtcXZ1aHFsemhrb3RvcnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTY3NTQsImV4cCI6MjA4ODgzMjc1NH0.yIqlOSSz_40EuFJV2DaLMIaD5Ou6A9ycMQMAxrMohyA';

// Initialize
let supabase;
try {
    supabase = window.supabase.createClient(SB_URL, SB_KEY);
} catch (e) {
    alert("CRITICAL: Library Supabase tak load. Pastikan internet OK.");
}

// ==================== LOAD TESTIMONIALS ====================
async function loadTestimonials() {
    const wrapper = document.getElementById('testimoniWrapper');
    const loading = document.getElementById('testimoniLoading');
    const container = document.getElementById('testimoniSwiper');

    try {
        // Step 1: Cuba tarik data
        const { data, error } = await supabase
            .from('testimonials')
            .select('*');

        // Step 2: Jika ada error dari Supabase, tunjuk Alert terus
        if (error) {
            alert("Ralat Supabase: " + error.message + "\nCode: " + error.code);
            if (loading) loading.style.display = 'none';
            return;
        }

        // Step 3: Jika data kosong
        if (!data || data.length === 0) {
            alert("Berjaya sambung, tapi data dalam table 'testimonials' KOSONG.");
            if (loading) loading.style.display = 'none';
            return;
        }

        // Step 4: Bina HTML
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
        
        wrapper.innerHTML = html;
        if (loading) loading.style.display = 'none';
        if (container) container.style.display = 'block';

        // Step 5: Start Swiper
        new Swiper('.mySwiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            observer: true,
            observeParents: true,
            pagination: { el: '.swiper-pagination', clickable: true },
            breakpoints: {
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
            }
        });

    } catch (err) {
        alert("Ralat JavaScript: " + err.message);
        if (loading) loading.style.display = 'none';
    }
}

// ==================== WHATSAPP FORM ====================
const regForm = document.getElementById('whatsappForm');
if (regForm) {
    regForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = document.getElementById('submitBtn');
        const originalText = btn.innerHTML;

        try {
            btn.disabled = true;
            btn.innerHTML = "Menghantar...";

            const sName = document.getElementById('stuName').value;
            const pName = document.getElementById('parentName').value;
            const pPhone = document.getElementById('parentPhone').value;
            const pEmail = document.getElementById('parentEmail').value;
            const sLevel = document.getElementById('stuLevel').value;
            const sSub = document.getElementById('stuSubject').value;
            const cType = document.getElementById('classType').value;

            // Simpan data
            const { error } = await supabase.from('students').insert([{
                name: sName,
                parent_name: pName,
                parent_phone: pPhone,
                parent_email: pEmail,
                student_level: sLevel,
                subject: sSub
            }]);

            if (error) throw error;

            // WhatsApp Redirect
            const msg = `Pendaftaran DALe EduHub%0ANama: ${sName}%0ASubjek: ${sSub}%0AJenis: ${cType}`;
            window.location.href = `https://wa.me/60128258869?text=${encodeURIComponent(msg)}`;

        } catch (err) {
            alert("Gagal daftar: " + err.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });
}

// Mobile Menu
window.toggleMobileMenu = function() {
    const nav = document.querySelector('.nav-links');
    if (nav) nav.style.display = (nav.style.display === 'flex') ? 'none' : 'flex';
};

// Start
window.addEventListener('load', loadTestimonials);
