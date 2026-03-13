// ==================== CONFIGURATION ====================
const SB_URL = 'https://ktfhmqvuhqlzhkotorsi.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmhtcXZ1aHFsemhrb3RvcnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTE2OTI2MTAsImV4cCI6MjAyNzI2ODYxMH0.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmhtcXZ1aHFsemhrb3RvcnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTY3NTQsImV4cCI6MjA4ODgzMjc1NH0.yIqlOSSz_40EuFJV2DaLMIaD5Ou6A9ycMQMAxrMohyA';

// Pastikan library Supabase dimuatkan
let supabase;
try {
    supabase = window.supabase.createClient(SB_URL, SB_KEY);
} catch (e) {
    alert("Library Supabase gagal dimuatkan. Sila semak sambungan internet.");
}

// ==================== 1. LOAD TESTIMONIALS ====================
async function loadTestimonials() {
    const wrapper = document.getElementById('testimoniWrapper');
    const loading = document.getElementById('testimoniLoading');
    const container = document.getElementById('testimoniSwiper');

    if (!wrapper) return;

    try {
        // Tarik data dari table testimonials
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
                        <div class="testi-text">"${t.message}"</div>
                        <div class="testi-name">${t.name}</div>
                        <div class="testi-subject">${t.subject}</div>
                    </div>
                </div>`;
            });
            wrapper.innerHTML = html;
            
            // Sembunyikan loading, tunjuk swiper
            if (loading) loading.style.display = 'none';
            if (container) container.style.display = 'block';

            // Mula Swiper
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
        } else {
            // Jika data berjaya ditarik tapi kosong
            if (loading) loading.style.display = 'none';
            wrapper.innerHTML = '<div class="testi-card">Tiada testimoni ditemui dalam database.</div>';
        }
    } catch (err) {
        if (loading) loading.style.display = 'none';
        alert("Ralat Testimoni: " + err.message);
    }
}

// ==================== 2. WHATSAPP FORM ====================
const regForm = document.getElementById('whatsappForm');
if (regForm) {
    regForm.addEventListener('submit', async function(e) {
        e.preventDefault(); 
        
        const btn = document.getElementById('submitBtn');
        const originalBtnText = btn.innerHTML;

        try {
            // UI Loading
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghantar...';

            // Ambil data dari input
            const sName = document.getElementById('stuName').value;
            const pName = document.getElementById('parentName').value;
            const pPhone = document.getElementById('parentPhone').value;
            const pEmail = document.getElementById('parentEmail').value;
            const sLevel = document.getElementById('stuLevel').value;
            const sSub = document.getElementById('stuSubject').value;
            const cType = document.getElementById('classType').value;
            const sMsg = document.getElementById('stuMsg').value || 'Tiada';

            // 1. Simpan ke Supabase (Table: students)
            const { error: sbError } = await supabase.from('students').insert([{
                name: sName,
                parent_name: pName,
                parent_phone: pPhone,
                parent_email: pEmail,
                student_level: sLevel,
                subject: sSub
            }]);

            if (sbError) throw sbError;

            // 2. Format Mesej WhatsApp
            const message = `*PENDAFTARAN DALE EDUHUB*%0A%0A` +
                            `Nama Pelajar: ${sName}%0A` +
                            `Tingkatan: ${sLevel}%0A` +
                            `Subjek: ${sSub}%0A` +
                            `Jenis: ${cType}%0A` +
                            `Penjaga: ${pName}%0A` +
                            `No Tel: ${pPhone}%0A` +
                            `Catatan: ${sMsg}`;

            // 3. Redirect ke WhatsApp
            const waUrl = `https://wa.me/60128258869?text=${message}`;
            
            // Guna window.location untuk lebih stabil di tablet
            window.location.href = waUrl;
            
            regForm.reset();

        } catch (err) {
            alert("Ralat Pendaftaran: " + err.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalBtnText;
        }
    });
}

// ==================== 3. MOBILE MENU ====================
window.toggleMobileMenu = function() {
    const nav = document.querySelector('.nav-links');
    if (nav) {
        nav.style.display = (nav.style.display === 'flex') ? 'none' : 'flex';
    }
};

// ==================== 4. INITIALIZE ====================
window.addEventListener('load', () => {
    loadTestimonials();
});
