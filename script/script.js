// ALERT 1: Pengesahan fail berjalan
alert("Sistem DALe EduHub: Memulakan sambungan...");

// --- CONFIGURATION ---
const SB_URL = 'https://ktfhmqvuhqlzhkotorsi.supabase.co';

// Kunci ini saya ambil terus daripada screenshot anda.
// Saya letakkan .trim() di hujung untuk buang sebarang 'space' tersembunyi.
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmhtcXZ1aHFsemhrb3RvcnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTE2OTI2MTAsImV4cCI6MjAyNzI2ODYxMH0.yIqlOSSz_40EuFJV2DaLMIaD5Ou6A9ycMQMAxrMohyA'.trim();

let supabase;

try {
    // Inisialisasi Supabase dengan kunci yang telah dibersihkan
    supabase = window.supabase.createClient(SB_URL, SB_KEY);
    console.log("Supabase client initialized.");
} catch (e) {
    alert("Ralat Pemula: " + e.message);
}

// --- FUNGSI LOAD TESTIMONI ---
async function loadTestimonials() {
    const wrapper = document.getElementById('testimoniWrapper');
    const loading = document.getElementById('testimoniLoading');
    const swiperCont = document.getElementById('testimoniSwiper');

    if (!wrapper) return;

    try {
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('active', true);

        if (error) {
            // Jika keluar Invalid API Key lagi, alert ini akan muncul
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
            
            alert("✅ Berjaya! Testimoni telah dimuatkan.");
        } else {
            alert("Maklum: Tiada data aktif dalam table testimonials.");
            if (loading) loading.style.display = 'none';
        }
    } catch (err) {
        alert("Ralat Sistem: " + err.message);
    }
}

// --- FUNGSI BORANG WHATSAPP ---
const myForm = document.getElementById('whatsappForm');
if (myForm) {
    myForm.onsubmit = async function(e) {
        e.preventDefault();
        const btn = document.getElementById('submitBtn');
        const originalText = btn.innerHTML;

        try {
            btn.disabled = true;
            btn.innerHTML = "Memproses...";

            const sName = document.getElementById('stuName').value;
            const pName = document.getElementById('parentName').value;
            const pPhone = document.getElementById('parentPhone').value;
            const pEmail = document.getElementById('parentEmail').value;
            const sLevel = document.getElementById('stuLevel').value;
            const sSub = document.getElementById('stuSubject').value;
            const cType = document.getElementById('classType').value;

            const { error } = await supabase.from('students').insert([{
                name: sName,
                parent_name: pName,
                parent_phone: pPhone,
                parent_email: pEmail,
                student_level: sLevel,
                subject: sSub
            }]);

            if (error) throw error;

            const msg = `*PENDAFTARAN DALE EDUHUB*%0A%0ANama: ${sName}%0ASubjek: ${sSub}%0AJenis: ${cType}`;
            window.location.href = `https://wa.me/60128258869?text=${msg}`;

        } catch (err) {
            alert("Gagal daftar: " + err.message);
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    };
}

// Menjalankan fungsi sebaik sahaja halaman dimuatkan sepenuhnya
window.addEventListener('load', loadTestimonials);
