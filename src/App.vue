<script setup>
    import { ref, computed, onMounted } from 'vue'
    import { 
        Trophy, RotateCcw, Save, Trash2, History, X, 
        User, ArrowRight, ArrowLeft, Activity 
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
    const scoringStep = ref(1) // 1 = Live (Accuracy), 2 = Post (Presentation)
    const activeTab = ref('scoring')
    
    const accuracy = ref(4.0)
    const actionStack = ref([]) // "Smart Undo" historia
    
    const speedPower = ref(2.0)
    const rhythmTempo = ref(2.0)
    const expressionEnergy = ref(2.0)
    
    const athleteName = ref('')
    const selectedPoomsae = ref('')
    const showSaveModal = ref(false)
    const history = ref([])
    
    // --- LOGIIKKA ---
    const presentationScore = computed(() => {
        return (parseFloat(speedPower.value) + parseFloat(rhythmTempo.value) + parseFloat(expressionEnergy.value))
    })
    
    const totalScore = computed(() => (accuracy.value + presentationScore.value).toFixed(1))
    
    onMounted(() => {
        const saved = localStorage.getItem('poomsae_history')
        if (saved) history.value = JSON.parse(saved)
    })
    
    // Pisteiden vähennys
    const deductScore = (amount) => {
        // Accuracy logic
        let newVal = accuracy.value + amount
        let actualDeduction = amount
        
        if (newVal < 0) {
            newVal = 0
            actualDeduction = -accuracy.value 
        }
        
        actionStack.value.push(actualDeduction) // Tallennetaan vain määrä, koska kohde on aina Acc
        accuracy.value = Math.round(newVal * 10) / 10
    }
    
    const undoLastAction = () => {
        const lastDeduction = actionStack.value.pop()
        if (lastDeduction !== undefined) {
            const newVal = accuracy.value - lastDeduction
            if (newVal <= 4.0) accuracy.value = Math.round(newVal * 10) / 10
        }
    }
    
    const resetScore = () => {
        if (confirm('Haluatko varmasti nollata kaiken?')) {
            scoringStep.value = 1
            accuracy.value = 4.0
            actionStack.value = []
            // Reset presentation defaults
            speedPower.value = 2.0
            rhythmTempo.value = 2.0
            expressionEnergy.value = 2.0
        }
    }
    
    // --- NAVIGAATIO VAIHEIDEN VÄLILLÄ ---
    
    const goToPresentation = () => {
        scoringStep.value = 2
    }
    
    const backToLive = () => {
        scoringStep.value = 1
    }
    
    // --- TALLENNUS ---
    
    const savePerformance = () => {
        if (!athleteName.value.trim()) return
        
        const poomsaeData = POOMSAE_DATA.find(p => p.name === selectedPoomsae.value)
        const poomsaeType = poomsaeData ? poomsaeData.type : 'unknown'
        
        const newRecord = {
            id: Date.now(),
            date: new Date().toLocaleString('fi-FI', { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' }),
            name: athleteName.value,
            poomsae: selectedPoomsae.value || 'Ei määritelty',
            poomsaeType: poomsaeType,
            // Tallennetaan kaikki osatekijät
            accuracy: accuracy.value.toFixed(1),
            presentation: presentationScore.value.toFixed(1),
            details: {
                speed: parseFloat(speedPower.value).toFixed(1),
                rhythm: parseFloat(rhythmTempo.value).toFixed(1),
                energy: parseFloat(expressionEnergy.value).toFixed(1)
            },
            total: totalScore.value
        }
        
        history.value.unshift(newRecord)
        localStorage.setItem('poomsae_history', JSON.stringify(history.value))
        
        // Reset
        showSaveModal.value = false
        resetAfterSave()
    }
    
    const resetAfterSave = () => {
        athleteName.value = ''
        selectedPoomsae.value = ''
        scoringStep.value = 1
        accuracy.value = 4.0
        actionStack.value = []
        speedPower.value = 2.0
        rhythmTempo.value = 2.0
        expressionEnergy.value = 2.0
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
    <div class="max-w-md mx-auto min-h-screen bg-slate-50 text-slate-900 shadow-2xl overflow-hidden relative font-sans">
        
        <main class="p-4 space-y-4">
            
            <div class="bg-slate-900 rounded-3xl p-3 text-center text-white shadow-xl shadow-slate-200">
                <p class="text-slate-400 text-xs font-bold uppercase tracking-widest">Kokonaispisteet</p>
                <div class="text-6xl font-black tabular-nums tracking-tighter leading-none">
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

                <!-- Scoring Step -->
                <div v-if="scoringStep === 1" class="flex-1 flex flex-col gap-3 animate-fade-in">
          
                    <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col flex-1 relative">
                        <div class="absolute top-3 left-3 bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded">VAIHE 1/2</div>
             
                        <div class="flex flex-col items-center justify-center flex-1 mt-4">
                            <h2 class="font-bold text-slate-400 text-sm uppercase tracking-widest mb-1">Accuracy</h2>
                            <span class="text-4xl font-black text-slate-800 tracking-tighter">{{ accuracy.toFixed(1) }}</span>
                            <span class="text-xs text-slate-400 mt-2 font-medium">Lähtöpisteet 4.0</span>
                        </div>

                        <div class="grid grid-cols-2 gap-3 h-32 mt-4">
                            <button @click="deductScore(-0.1)" class="h-full bg-red-50 text-red-600 border border-red-100 rounded-xl font-black text-2xl active:scale-95 transition-transform hover:bg-red-100 touch-manipulation shadow-sm">
                                -0.1
                            </button>
                            <button @click="deductScore(-0.3)" class="h-full bg-red-50 text-red-600 border border-red-100 rounded-xl font-black text-2xl active:scale-95 transition-transform hover:bg-red-100 touch-manipulation shadow-sm">
                                -0.3
                            </button>
                        </div>
             
                        <div class="mt-3 flex justify-center">
                            <button @click="undoLastAction" class="text-xs text-slate-400 flex items-center gap-1 hover:text-blue-600 py-2 px-4 rounded-full bg-slate-50">
                                <RotateCcw :size="12" /> Peruuta viimeisin
                            </button>
                        </div>
                    </div>

                    <button @click="goToPresentation" class="h-16 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
                        Suoritus päättyi <ArrowRight :size="20" />
                    </button>
                </div>

                <!-- Presentation Step -->
                <div v-else class="flex-1 flex flex-col gap-4 animate-fade-in">
                    <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex-1 flex flex-col justify-between">
                        <div class="flex justify-between items-center mb-2">
                            <button @click="backToLive" class="text-xs font-bold text-slate-400 flex items-center gap-1"><ArrowLeft :size="12"/> Palaa</button>
                            <div class="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded">VAIHE 2/2</div>
                        </div>

                        <div class="text-center mb-1">
                            <h2 class="font-bold text-slate-500 text-xs uppercase tracking-widest">Presentation</h2>
                            <div class="text-4xl font-black text-blue-600">{{ presentationScore.toFixed(1) }}</div>
                        </div>

                        <div class="space-y-1">
                            <div>
                                <div class="flex justify-between mb-2">
                                    <label class="text-xs font-bold text-slate-700 uppercase">Speed & Power</label>
                                    <span class="text-sm font-black text-slate-900">{{ parseFloat(speedPower).toFixed(1) }}</span>
                                </div>
                                <input 
                                    type="range" min="0" max="2.0" step="0.1" 
                                    v-model="speedPower"
                                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    >
                                <div class="flex justify-between text-[10px] text-slate-400 mt-1"><span>0.0</span><span>2.0</span></div>
                            </div>

                            <div>
                                <div class="flex justify-between mb-2">
                                    <label class="text-xs font-bold text-slate-700 uppercase">Rhythm & Tempo</label>
                                    <span class="text-sm font-black text-slate-900">{{ parseFloat(rhythmTempo).toFixed(1) }}</span>
                                </div>
                                <input 
                                    type="range" min="0" max="2.0" step="0.1" 
                                    v-model="rhythmTempo"
                                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    >
                                <div class="flex justify-between text-[10px] text-slate-400 mt-1"><span>0.0</span><span>2.0</span></div>
                            </div>

                            <div>
                                <div class="flex justify-between mb-2">
                                    <label class="text-xs font-bold text-slate-700 uppercase">Expression of Energy</label>
                                    <span class="text-sm font-black text-slate-900">{{ parseFloat(expressionEnergy).toFixed(1) }}</span>
                                </div>
                                <input 
                                    type="range" min="0" max="2.0" step="0.1" 
                                    v-model="expressionEnergy"
                                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    >
                                <div class="flex justify-between text-[10px] text-slate-400 mt-1"><span>0.0</span><span>2.0</span></div>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3 h-14 flex-none">
                        <button @click="resetScore" class="bg-slate-200 text-slate-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                            <RotateCcw :size="16" /> Nollaa
                        </button>
                        <button @click="showSaveModal = true" class="bg-green-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg">
                            <Save :size="16" /> Tallenna
                        </button>
                    </div>

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
                        Acc: <b>{{ item.accuracy }}</b> / Pres: <b>{{ item.presentation }}</b><br/>S&P: {{ item.details.speed }}, R&T: {{ item.details.rhythm }}, EoE: {{ item.details.energy }}
                        <span class=" text-slate-300">|</span> <span class="text-slate-400">{{ item.date }}</span>
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

        <footer class="flex-none p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2 opacity-60 grayscale hover:grayscale-0 transition-all">
            <img src="/logo.png" alt="Logo" class="h-5 w-5 object-contain" onError="this.style.display='none'" />
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Länkyn Taekwondo</span>
        </footer>

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