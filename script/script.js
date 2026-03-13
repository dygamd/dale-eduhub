// ALERT 1: Ujian fail script berjaya dipanggil
alert("Script Bermula!");

const SB_URL = 'https://ktfhmqvuhqlzhkotorsi.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmhtcXZ1aHFsemhrb3RvcnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTY3NTQsImV4cCI6MjA4ODgzMjc1NH0.yIqlOSSz_40EuFJV2DaLMIaD5Ou6A9ycMQMAxrMohyA';

let supabase;

try {
    supabase = window.supabase.createClient(SB_URL, SB_KEY);
    alert("Supabase Berjaya Diaktifkan!");
} catch (e) {
    alert("Gagal aktifkan Supabase: " + e.message);
}

async function loadData() {
    const wrapper = document.getElementById('testimoniWrapper');
    const loading = document.getElementById('testimoniLoading');

    try {
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('active', true);

        if (error) {
            alert("Ralat Table: " + error.message);
            return;
        }

        if (data && data.length > 0) {
            let html = "";
            data.forEach(t => {
                html += `
                <div class="swiper-slide">
                    <div class="testi-card">
                        <p>"${t.message}"</p>
                        <h4>${t.name}</h4>
                        <small>${t.subject}</small>
                    </div>
                </div>`;
            });
            wrapper.innerHTML = html;
            
            if (loading) loading.style.display = 'none';
            document.getElementById('testimoniSwiper').style.display = 'block';

            new Swiper('.mySwiper', {
                slidesPerView: 1,
                spaceBetween: 10,
                pagination: { el: '.swiper-pagination' },
                breakpoints: { 768: { slidesPerView: 2 } }
            });
            alert("Testimoni Berjaya Dimuatkan!");
        } else {
            alert("Data kosong. Sila semak table testimonials di Supabase.");
            if (loading) loading.style.display = 'none';
        }
    } catch (err) {
        alert("Ralat Proses: " + err.message);
    }
}

// Logik Form WhatsApp
const myForm = document.getElementById('whatsappForm');
if (myForm) {
    myForm.onsubmit = function(e) {
        e.preventDefault();
        const nama = document.getElementById('stuName').value;
        const subjek = document.getElementById('stuSubject').value;
        
        const teks = `Halo Cikgu Dayang! Saya nak daftar:%0A%0A` +
                     `Nama: ${nama}%0ASubjek: ${subjek}`;
        
        alert("Membuka WhatsApp...");
        window.location.href = `https://wa.me/60128258869?text=${teks}`;
    };
}

// Jalankan loadData bila semua fail siap
window.onload = loadData;
