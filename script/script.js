// ALERT 1: Pengesahan fail berjalan
alert("Menyambung ke DALe EduHub...");

const SB_URL = 'https://ktfhmqvuhqlzhkotorsi.supabase.co';

// KUNCI TERKINI (Sama seperti teks yang anda hantar)
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmhtcXZ1aHFsemhrb3RvcnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTY3NTQsImV4cCI6MjA4ODgzMjc1NH0.yIqlOSSz_40EuFJV2DaLMIaD5Ou6A9ycMQMAxrMohyA';

let supabase;

try {
    // Inisialisasi Supabase - Gunakan .trim() untuk buang sebarang 'space'
    supabase = window.supabase.createClient(SB_URL, SB_KEY.trim());
} catch (e) {
    alert("Ralat Pemula: " + e.message);
}

// ==================== LOAD TESTIMONIALS ====================
async function loadTestimonials() {
    const wrapper = document.getElementById('testimoniWrapper');
    const loading = document.getElementById('testimoniLoading');
    const swiperCont = document.getElementById('testimoniSwiper');

    if (!wrapper) return;

    try {
        // Ambil data dari table 'testimonials'
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('active', true);

        if (error) {
            alert("Ralat Supabase: " + error.message);
            return;
        }

        if (data && data.length > 0) {
            let html = "";
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
            if (swiperCont) swiperCont.style.display = 'block';

            // Mula Swiper Slider
            new Swiper('.mySwiper', {
                slidesPerView: 1,
                spaceBetween: 20,
                loop: data.length > 1,
                observer: true,
                observeParents: true,
                pagination: { el: '.swiper-pagination', clickable: true },
                breakpoints: {
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 }
                }
            });
            
            alert("✅ Berjaya! Testimoni dimuatkan.");
        } else {
            alert("Sambungan Berjaya, tetapi tiada data ditemui.");
            if (loading) loading.style.display = 'none';
        }
    } catch (err) {
        alert("Ralat Sistem: " + err.message);
    }
}

// ==================== WHATSAPP FORM ====================
const regForm = document.getElementById('whatsappForm');
if (regForm) {
    regForm.onsubmit = async function(e) {
        e.preventDefault();
        const btn = document.getElementById('submitBtn');
        const originalText = btn.innerHTML;

        try {
            btn.disabled = true;
            btn.innerHTML = "Sila Tunggu...";

            // Ambil data input
            const sName = document.getElementById('stuName').value;
            const pName = document.getElementById('parentName').value;
            const pPhone = document.getElementById('parentPhone').value;
            const pEmail = document.getElementById('parentEmail').value;
            const sLevel = document.getElementById('stuLevel').value;
            const sSub = document.getElementById('stuSubject').value;
            const cType = document.getElementById('classType').value;

            // 1. Simpan ke Supabase (Table: students)
            const { error: insertError } = await supabase.from('students').insert([{
                name: sName,
                parent_name: pName,
                parent_phone: pPhone,
                parent_email: pEmail,
                student_level: sLevel,
                subject: sSub
            }]);

            if (insertError) throw insertError;

            // 2. Format & Redirect ke WhatsApp
            const waMsg = `*PENDAFTARAN DALE EDUHUB*%0A%0A` +
                          `Pelajar: ${sName}%0A` +
                          `Tingkatan: ${sLevel}%0A` +
                          `Subjek: ${sSub}%0A` +
                          `Pakej: ${cType}`;
            
            window.location.href = `https://wa.me/60128258869?text=${waMsg}`;

        } catch (err) {
            alert("Gagal Daftar: " + err.message);
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    };
}

// Jalankan sistem bila halaman siap
window.onload = loadTestimonials;
