// ALERT 1: Untuk pastikan fail dikesan
alert("Menyambung ke DALe EduHub...");

const SB_URL = 'https://ktfhmqvuhqlzhkotorsi.supabase.co';
// Key yang telah dibersihkan
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmhtcXZ1aHFsemhrb3RvcnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTE2OTI2MTAsImV4cCI6MjAyNzI2ODYxMH0.yIqlOSSz_40EuFJV2DaLMIaD5Ou6A9ycMQMAxrMohyA';

let supabase;

try {
    supabase = window.supabase.createClient(SB_URL, SB_KEY);
} catch (e) {
    alert("Ralat Pemula: " + e.message);
}

async function loadTestimonials() {
    const wrapper = document.getElementById('testimoniWrapper');
    const loading = document.getElementById('testimoniLoading');
    const swiperCont = document.getElementById('testimoniSwiper');

    try {
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

            // Mula Swiper
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
            
            alert("Testimoni Berjaya Dimuatkan!");
        } else {
            alert("Sambungan OK, tetapi tiada data dalam table.");
            if (loading) loading.style.display = 'none';
        }
    } catch (err) {
        alert("Ralat Sistem: " + err.message);
    }
}

// Borang WhatsApp
const myForm = document.getElementById('whatsappForm');
if (myForm) {
    myForm.onsubmit = async function(e) {
        e.preventDefault();
        const btn = document.getElementById('submitBtn');
        btn.disabled = true;
        btn.innerHTML = "Sila Tunggu...";

        try {
            const sName = document.getElementById('stuName').value;
            const pName = document.getElementById('parentName').value;
            const pPhone = document.getElementById('parentPhone').value;
            const pEmail = document.getElementById('parentEmail').value;
            const sLevel = document.getElementById('stuLevel').value;
            const sSub = document.getElementById('stuSubject').value;
            const cType = document.getElementById('classType').value;

            // Simpan ke Database
            const { error } = await supabase.from('students').insert([{
                name: sName,
                parent_name: pName,
                parent_phone: pPhone,
                parent_email: pEmail,
                student_level: sLevel,
                subject: sSub
            }]);

            if (error) throw error;

            // Redirect ke WhatsApp
            const msg = `*PENDAFTARAN DALE EDUHUB*%0A%0ANama: ${sName}%0ASubjek: ${sSub}%0AJenis: ${cType}`;
            window.location.href = `https://wa.me/60128258869?text=${msg}`;

        } catch (err) {
            alert("Gagal daftar: " + err.message);
            btn.disabled = false;
            btn.innerHTML = "Hantar";
        }
    };
}

window.onload = loadTestimonials;
