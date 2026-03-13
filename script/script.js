// Ganti dengan maklumat Supabase anda
const SB_URL = 'https://ktfhmqvuhqlzhkotorsi.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmhtcXZ1aHFsemhrb3RvcnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTE2OTI2MTAsImV4cCI6MjAyNzI2ODYxMH0.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmhtcXZ1aHFsemhrb3RvcnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTY3NTQsImV4cCI6MjA4ODgzMjc1NH0.yIqlOSSz_40EuFJV2DaLMIaD5Ou6A9ycMQMAxrMohyA';

// Initialize Supabase client
const supabase = window.supabase.createClient(SB_URL, SB_KEY);

// --- 1. AMBIL DATA TESTIMONI ---
async function dapatkanTestimoni() {
    const wrapper = document.getElementById('testimoniWrapper');
    const loading = document.getElementById('testimoniLoading');
    const container = document.getElementById('testimoniSwiper');

    try {
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('active', true);

        if (error) throw error;

        if (data && data.length > 0) {
            let html = '';
            data.forEach(t => {
                html += `
                <div class="swiper-slide">
                    <div class="testi-card">
                        <p>"${t.message}"</p>
                        <strong>${t.name}</strong><br>
                        <small>${t.subject}</small>
                    </div>
                </div>`;
            });
            wrapper.innerHTML = html;
            
            if (loading) loading.style.display = 'none';
            if (container) container.style.display = 'block';

            // Start Swiper
            new Swiper('.mySwiper', {
                slidesPerView: 1,
                spaceBetween: 20,
                loop: true,
                pagination: { el: '.swiper-pagination', clickable: true },
                breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
            });
        }
    } catch (err) {
        alert("Ralat database: " + err.message);
    }
}

// --- 2. HANTAR FORM KE SUPABASE & WHATSAPP ---
const borang = document.getElementById('whatsappForm');
if (borang) {
    borang.addEventListener('submit', async function(e) {
        e.preventDefault(); // PENTING: Supaya page tak refresh
        
        const btn = document.getElementById('submitBtn');
        const teksAsal = btn.innerHTML;

        try {
            btn.disabled = true;
            btn.innerHTML = "Sila tunggu...";

            // Ambil data
            const namaPelajar = document.getElementById('stuName').value;
            const namaPenjaga = document.getElementById('parentName').value;
            const telPenjaga = document.getElementById('parentPhone').value;
            const emelPenjaga = document.getElementById('parentEmail').value;
            const tahap = document.getElementById('stuLevel').value;
            const subjek = document.getElementById('stuSubject').value;
            const jenis = document.getElementById('classType').value;

            // Simpan ke Supabase
            const { error } = await supabase.from('students').insert([{
                name: namaPelajar,
                parent_name: namaPenjaga,
                parent_phone: telPenjaga,
                parent_email: emelPenjaga,
                student_level: tahap,
                subject: subjek
            }]);

            if (error) throw error;

            // Buka WhatsApp
            const mesej = `Halo Cikgu Dayang! Saya nak daftar:%0A%0A` +
                          `Pelajar: ${namaPelajar}%0A` +
                          `Subjek: ${subjek}%0A` +
                          `Tahap: ${tahap}%0A` +
                          `Jenis: ${jenis}`;
            
            window.location.href = `https://wa.me/60128258869?text=${mesej}`;

        } catch (err) {
            alert("Ralat hantar: " + err.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = teksAsal;
        }
    });
}

// Jalankan fungsi bila page siap
window.onload = dapatkanTestimoni;
