<script setup>
    import { ref, computed, onMounted } from 'vue'
    import { 
        Trophy, RotateCcw, Save, Trash2, History, X, User, Activity 
    } from 'lucide-vue-next'
    
    // --- DATALÄHTEET ---
    
    const POOMSAE_DATA = [
    // Perusliikkeet (Gi Chu) - Keltainen teema
    { name: 'Gi Chu 1', type: 'basic' },
    { name: 'Gi Chu 2', type: 'basic' },
    { name: 'Gi Chu 3', type: 'basic' },
    // Värivyöt (Taegeuk) - Sininen/Punainen teema
    { name: 'Taegeuk 1 (Il Jang)', type: 'color' },
    { name: 'Taegeuk 2 (Yi Jang)', type: 'color' },
    { name: 'Taegeuk 3 (Sam Jang)', type: 'color' },
    { name: 'Taegeuk 4 (Sa Jang)', type: 'color' },
    { name: 'Taegeuk 5 (Oh Jang)', type: 'color' },
    { name: 'Taegeuk 6 (Yuk Jang)', type: 'color' },
    { name: 'Taegeuk 7 (Chil Jang)', type: 'color' },
    { name: 'Taegeuk 8 (Pal Jang)', type: 'color' },
    // Mustat vyöt - Tumma teema
    { name: 'Koryo', type: 'black' },
    { name: 'Keumgang', type: 'black' },
    { name: 'Taebaek', type: 'black' },
    { name: 'Pyongwon', type: 'black' },
    { name: 'Sipjin', type: 'black' },
    { name: 'Jitae', type: 'black' },
    { name: 'Chonkwon', type: 'black' },
    { name: 'Hansu', type: 'black' },
    { name: 'Ilyo', type: 'black' }
    ]
    
    // --- TILA (STATE) ---
    const accuracy = ref(4.0)
    const presentation = ref(6.0)
    
    const actionStack = ref([]) // "Smart Undo" historia
    const athleteName = ref('')
    const selectedPoomsae = ref('')
    const showSaveModal = ref(false)
    const activeTab = ref('scoring') 
    const history = ref([])
    
    // --- LOGIIKKA ---
    
    const totalScore = computed(() => (accuracy.value + presentation.value).toFixed(1))
    
    onMounted(() => {
        const saved = localStorage.getItem('poomsae_history')
        if (saved) history.value = JSON.parse(saved)
    })
    
    // Pisteiden vähennys ja toiminnon tallennus pinoon
    const deductScore = (category, amount) => {
        // Tallennetaan toiminto pinoon ennen muutosta, jotta se voidaan kumota
        actionStack.value.push({ category, amount })
        
        if (category === 'acc') {
            const newVal = accuracy.value + amount // amount on negatiivinen (esim -0.1)
            if (newVal >= 0) accuracy.value = Math.round(newVal * 10) / 10
        } else {
            const newVal = presentation.value + amount
            if (newVal >= 0) presentation.value = Math.round(newVal * 10) / 10
        }
    }
    
    // Älykäs kumoaminen (Undo)
    const undoLastAction = (category) => {
        // Etsitään pinosta viimeisin toiminto, joka kohdistui tähän kategoriaan
        // Tehdään haku lopusta alkuun
        const index = actionStack.value.findLastIndex(action => action.category === category)
        
        if (index !== -1) {
            const action = actionStack.value[index]
            
            // Palautetaan pisteet (vähennys oli negatiivinen, joten vähennyksen vähennys on plussaa)
            if (category === 'acc') {
                const newVal = accuracy.value - action.amount 
                if (newVal <= 4.0) accuracy.value = Math.round(newVal * 10) / 10
            } else {
                const newVal = presentation.value - action.amount
                if (newVal <= 6.0) presentation.value = Math.round(newVal * 10) / 10
            }
            
            // Poistetaan toiminto pinosta
            actionStack.value.splice(index, 1)
        }
    }
    
    const resetScore = () => {
        if (confirm('Haluatko varmasti nollata pisteet ja aloittaa alusta?')) {
            accuracy.value = 4.0
            presentation.value = 6.0
            actionStack.value = [] // Tyhjennetään undo-historia
        }
    }
    
    const savePerformance = () => {
        if (!athleteName.value.trim()) return
        
        // Etsitään poomsaen tyyppi värikoodausta varten
        const poomsaeData = POOMSAE_DATA.find(p => p.name === selectedPoomsae.value)
        const poomsaeType = poomsaeData ? poomsaeData.type : 'unknown'
        
        const newRecord = {
            id: Date.now(),
            date: new Date().toLocaleString('fi-FI', { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' }),
            name: athleteName.value,
            poomsae: selectedPoomsae.value || 'Ei määritelty',
            poomsaeType: poomsaeType,
            accuracy: accuracy.value.toFixed(1),
            presentation: presentation.value.toFixed(1),
            total: totalScore.value
        }
        
        history.value.unshift(newRecord)
        localStorage.setItem('poomsae_history', JSON.stringify(history.value))
        
        // Resetoidaan tilanne tallennuksen jälkeen
        showSaveModal.value = false
        athleteName.value = ''
        selectedPoomsae.value = ''
        accuracy.value = 4.0
        presentation.value = 6.0
        actionStack.value = []
    }
    
    const deleteRecord = (id) => {
        if (confirm('Poistetaanko suoritus historiasta?')) {
            history.value = history.value.filter(item => item.id !== id)
            localStorage.setItem('poomsae_history', JSON.stringify(history.value))
        }
    }
    
    // Apufunktio värikoodaukselle (Tailwind-luokat)
    const getPoomsaeColorClass = (type) => {
        switch (type) {
            case 'basic': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'color': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'black': return 'bg-slate-800 text-slate-100 border-slate-600'
            default: return 'bg-slate-100 text-slate-600 border-slate-200'
        }
    }
</script>

<template>
    <div class="max-w-md mx-auto min-h-screen bg-slate-50 text-slate-900 pb-10 shadow-2xl overflow-hidden relative font-sans">
        
        <header class="bg-white p-4 shadow-sm border-b border-slate-100 flex items-center gap-3 sticky top-0 z-10">
            <img src="/logo.png" alt="Seuran logo" />
            <h1 class="font-bold text-lg tracking-tight text-slate-800">WT Poomsae</h1>
        </header>
        
        <main class="p-4 space-y-6">
            
            <div class="bg-slate-900 rounded-3xl p-6 text-center text-white shadow-xl shadow-slate-200">
                <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Kokonaispisteet</p>
                <div class="text-8xl font-black tabular-nums tracking-tighter leading-none">
                    {{ totalScore }}
                </div>
            </div>
            
            <div class="bg-slate-200 p-1 rounded-xl flex font-semibold text-sm">
                <button 
                    @click="activeTab = 'scoring'"
                    :class="['flex-1 py-2.5 rounded-lg transition-all', activeTab === 'scoring' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700']"
                    >
                    Pisteytys
                </button>
                <button 
                    @click="activeTab = 'history'"
                    :class="['flex-1 py-2.5 rounded-lg transition-all', activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700']"
                    >
                    Historia
                </button>
            </div>
    
            <div v-if="activeTab === 'scoring'" class="space-y-4 animate-fade-in">
                
                <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div class="flex justify-between items-end mb-4">
                        <h2 class="font-bold text-slate-500 text-sm uppercase">Tarkkuus (4.0)</h2>
                        <span class="text-3xl font-black text-blue-600">{{ accuracy.toFixed(1) }}</span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <button @click="deductScore('acc', -0.1)" class="h-16 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-xl active:scale-95 transition-transform hover:bg-red-100">
                            -0.1
                        </button>
                        <button @click="deductScore('acc', -0.3)" class="h-16 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-xl active:scale-95 transition-transform hover:bg-red-100">
                            -0.3
                        </button>
                    </div>
                    <div class="mt-2 flex justify-end">
                        <button @click="undoLastAction('acc')" class="text-xs text-slate-400 flex items-center gap-1 hover:text-blue-600 py-2 px-2 active:text-blue-800">
                            <RotateCcw :size="12" /> Peruuta viimeisin
                        </button>
                    </div>
                </div>
                
                <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div class="flex justify-between items-end mb-4">
                        <h2 class="font-bold text-slate-500 text-sm uppercase">Esitys (6.0)</h2>
                        <span class="text-3xl font-black text-blue-600">{{ presentation.toFixed(1) }}</span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <button @click="deductScore('pres', -0.1)" class="h-16 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-xl active:scale-95 transition-transform hover:bg-red-100">
                            -0.1
                        </button>
                        <button @click="deductScore('pres', -0.3)" class="h-16 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-xl active:scale-95 transition-transform hover:bg-red-100">
                            -0.3
                        </button>
                    </div>
                    <div class="mt-2 flex justify-end">
                        <button @click="undoLastAction('pres')" class="text-xs text-slate-400 flex items-center gap-1 hover:text-blue-600 py-2 px-2 active:text-blue-800">
                            <RotateCcw :size="12" /> Peruuta viimeisin
                        </button>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 pt-2">
                    <button @click="resetScore" class="h-14 rounded-xl font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 active:scale-95 transition-transform flex items-center justify-center gap-2">
                        <RotateCcw :size="18" /> Nollaa
                    </button>
                    <button @click="showSaveModal = true" class="h-14 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 active:scale-95 transition-transform flex items-center justify-center gap-2">
                        <Save :size="18" /> Tallenna
                    </button>
                </div>
            </div>
            
            <div v-else class="space-y-4 animate-fade-in">
                <div v-if="history.length === 0" class="text-center py-10 text-slate-400">
                    <History :size="48" class="mx-auto mb-2 opacity-20" />
                    <p>Ei vielä suorituksia.</p>
                </div>
                
                <div v-for="item in history" :key="item.id" class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start justify-between">
                    <div>
                        <div class="font-bold text-slate-800 text-lg flex items-center gap-2">
                            {{ item.name }}
                        </div>
                        
                        <div class="mt-1 mb-2">
                            <span 
                            :class="['text-[10px] font-bold px-2 py-0.5 rounded-full border', getPoomsaeColorClass(item.poomsaeType)]"
                            >
                                {{ item.poomsae }}
                            </span>
                        </div>
                    
                        <div class="text-xs text-slate-500 bg-slate-50 inline-block px-2 py-1 rounded">
                            Acc: <b>{{ item.accuracy }}</b> / Pres: <b>{{ item.presentation }}</b>
                            <span class="ml-2 text-slate-300">|</span> <span class="ml-1 text-slate-400">{{ item.date }}</span>
                        </div>
                    </div>
                    <div class="flex flex-col items-end gap-2 pl-2">
                        <div class="text-2xl font-black text-blue-600">{{ item.total }}</div>
                        <button @click="deleteRecord(item.id)" class="text-slate-300 hover:text-red-500 p-2">
                            <Trash2 :size="18" />
                        </button>
                    </div>
                </div>
            </div>

        </main>

        <div v-if="showSaveModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
            <div class="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-scale-in">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="font-bold text-xl text-slate-800">Tallenna tulos</h3>
                    <button @click="showSaveModal = false" class="text-slate-400 hover:text-slate-600 bg-slate-100 p-1 rounded-full"><X :size="20" /></button>
                </div>
                
                <div class="space-y-4 mb-6">
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                            <User :size="12" /> Kilpailijan nimi
                        </label>
                        <input 
                        v-model="athleteName"
                        type="text" 
                        placeholder="esim. Matti Meikäläinen" 
                        class="w-full text-base p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                        autoFocus
                        />
                    </div>
                    
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                            <Activity :size="12" /> Liikesarja (Poomsae)
                        </label>
                        <input 
                        v-model="selectedPoomsae"
                        list="poomsae-options" 
                        placeholder="Valitse tai kirjoita..." 
                        class="w-full text-base p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                        />
                        <datalist id="poomsae-options">
                            <option v-for="p in POOMSAE_DATA" :key="p.name" :value="p.name" />
                        </datalist>
                    </div>
                </div>
                
                <div class="bg-blue-50 p-4 rounded-2xl mb-6 flex justify-between items-center">
                    <span class="text-blue-800 font-medium text-sm uppercase tracking-wide">Lopputulos</span>
                    <span class="text-4xl font-black text-blue-700">{{ totalScore }}</span>
                </div>
                
                <button 
                    @click="savePerformance"
                    :disabled="!athleteName"
                    class="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-200 disabled:opacity-50 disabled:shadow-none hover:bg-blue-700 active:scale-95 transition-all"
                    >
                    Tallenna historiaan
                </button>
            </div>
        </div>

    </div>
</template>

<style>
    /* Simppeli animaatio modaalille ja välilehdille */
    @keyframes scaleIn {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    .animate-scale-in {
        animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
        animation: fadeIn 0.3s ease-out forwards;
    }
</style>