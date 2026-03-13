// ==================== SUPABASE CONFIG ====================
const SUPABASE_URL = 'https://ktfhmqvuhqlzhkotorsi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_kOz2lNp6289X7bajR5qmTw_Q1_Vh1zf';

console.log('🔧 Initializing Supabase with:');
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_KEY.substring(0, 15) + '...');

// ✅ Cara BETUL - dengan headers yang tepat
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    global: {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        }
    }
});

// ==================== LOAD TESTIMONIALS ====================
async function loadTestimonials() {
    console.log('🔄 Loading testimonials...');
    
    const loading = document.getElementById('testimoniLoading');
    const container = document.getElementById('testimoniContainer');
    
    if (!container) {
        console.error('Container not found!');
        return;
    }
    
    try {
        // Test query dengan headers yang betul
        console.log('📡 Sending request to Supabase...');
        
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('active', true);

        if (error) {
            console.error('❌ Supabase error:', error);
            console.log('Error details:', JSON.stringify(error, null, 2));
            useFallbackTestimonials();
            return;
        }

        console.log('✅ Supabase response:', data);
        
        if (data && data.length > 0) {
            displayTestimonials(data);
        } else {
            console.log('No data found, using fallback');
            useFallbackTestimonials();
        }
    } catch (err) {
        console.error('❌ Exception:', err);
        useFallbackTestimonials();
    }
}

// ==================== DISPLAY ====================
function displayTestimonials(testimonials) {
    const container = document.getElementById('testimoniContainer');
    const loading = document.getElementById('testimoniLoading');
    
    container.innerHTML = testimonials.map(t => `
        <div class="testi-card">
            <p>"${t.message}"</p>
            <h4>${t.name}</h4>
            <small>${t.subject}</small>
        </div>
    `).join('');
    
    loading.style.display = 'none';
    console.log('✅ Testimonials displayed');
}

// ==================== FALLBACK ====================
function useFallbackTestimonials() {
    const dummyData = [
        {
            name: "Cik Syuhada",
            subject: "Matematik (Menengah Atas)",
            message: "Kelas dengan cikgu Dayang sangat okay."
        },
        {
            name: "Encik Azimy",
            subject: "Sains Komputer",
            message: "Anak saya okay dan faham."
        },
        {
            name: "Puan Basyirah",
            subject: "Matematik (Menengah Rendah)",
            message: "Terima kasih cikgu Dayang."
        }
    ];
    displayTestimonials(dummyData);
}

// ==================== WHATSAPP ====================
document.getElementById('whatsappForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    
    if (!name || !phone) {
        alert('Sila isi semua');
        return;
    }
    
    try {
        await supabase.from('students').insert([{
            name: name,
            parent_phone: phone
        }]);
        console.log('✅ Saved to Supabase');
    } catch (err) {
        console.error('❌ Error saving:', err);
    }
    
    const waText = `Salam Cikgu Dayang, saya ${name}. No telefon: ${phone}`;
    window.open(`https://wa.me/60128258869?text=${encodeURIComponent(waText)}`, '_blank');
    alert('Pendaftaran dihantar!');
});

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', loadTestimonials);
