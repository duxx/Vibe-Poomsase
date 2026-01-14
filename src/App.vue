<script setup>
    import { ref, computed, onMounted } from 'vue'
    import { 
        Trophy, RotateCcw, Save, Trash2, History, X, Plus 
    } from 'lucide-vue-next'

    // --- TILA (STATE) ---
    const accuracy = ref(4.0)
    const presentation = ref(6.0)
    const athleteName = ref('')
    const showSaveModal = ref(false)
    const activeTab = ref('scoring') // 'scoring' tai 'history'
    const history = ref([])

    // --- LOGIIKKA ---

    // Lasketaan yhteispisteet (Acc + Pres)
    const totalScore = computed(() => {
        return (accuracy.value + presentation.value).toFixed(1)
    })

    // Lataa historia käynnistyessä
    onMounted(() => {
        const saved = localStorage.getItem('poomsae_history')
        if (saved) {
            history.value = JSON.parse(saved)
        }
    })

    // Pisteiden säätö (estetään menemästä alle nollan tai yli maksimin)
    const adjustScore = (category, amount) => {
        if (category === 'acc') {
            const newVal = accuracy.value + amount
            // Tarkkuus max 4.0, min 0.0. Pyöristys korjaa javascriptin 0.1+0.2 ongelmat
            if (newVal <= 4.0 && newVal >= 0) {
                accuracy.value = Math.round(newVal * 10) / 10
            }
        } else {
            const newVal = presentation.value + amount
            // Esitys max 6.0, min 0.0
            if (newVal <= 6.0 && newVal >= 0) {
                presentation.value = Math.round(newVal * 10) / 10
            }
        }
    }

    // Nollaus
    const resetScore = () => {
        if (confirm('Haluatko varmasti nollata pisteet?')) {
            accuracy.value = 4.0
            presentation.value = 6.0
        }
    }

    // Tallennus
    const savePerformance = () => {
        if (!athleteName.value.trim()) return

        const newRecord = {
            id: Date.now(),
            date: new Date().toLocaleString('fi-FI', { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' }),
            name: athleteName.value,
            accuracy: accuracy.value.toFixed(1),
            presentation: presentation.value.toFixed(1),
            total: totalScore.value
        }

        // Lisätään listan alkuun
        history.value.unshift(newRecord)

        // Tallennetaan selaimeen
        localStorage.setItem('poomsae_history', JSON.stringify(history.value))

        // Siivotaan näkymä
        showSaveModal.value = false
        athleteName.value = ''
        accuracy.value = 4.0
        presentation.value = 6.0
    }

    // Poistaminen
    const deleteRecord = (id) => {
        if (confirm('Poistetaanko suoritus historiasta?')) {
            history.value = history.value.filter(item => item.id !== id)
            localStorage.setItem('poomsae_history', JSON.stringify(history.value))
        }
    }
</script>

<template>
    <div class="max-w-md mx-auto min-h-screen bg-slate-50 text-slate-900 pb-10 shadow-2xl overflow-hidden relative">

        <header class="bg-white p-4 shadow-sm border-b border-slate-100 flex items-center gap-3 sticky top-0 z-10">
            <div class="bg-blue-600 p-2 rounded-lg text-white">
                <Trophy :size="20" />
            </div>
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
                    :class="['flex-1 py-2.5 rounded-lg transition-all', activeTab === 'scoring' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700']">
                    Pisteytys
                </button>
                <button 
                    @click="activeTab = 'history'"
                    :class="['flex-1 py-2.5 rounded-lg transition-all', activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700']">
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
                        <button 
                            @click="adjustScore('acc', -0.1)" 
                            class="h-16 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-xl active:scale-95 transition-transform hover:bg-red-100">
                            -0.1
                        </button>
                        <button 
                            @click="adjustScore('acc', -0.3)" 
                            class="h-16 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-xl active:scale-95 transition-transform hover:bg-red-100">
                            -0.3
                        </button>
                    </div>
                    <div class="mt-2 flex justify-end">
                        <button 
                            @click="adjustScore('acc', 0.1)" 
                            class="text-xs text-slate-400 flex items-center gap-1 hover:text-blue-600 py-2 px-2">
                            <RotateCcw :size="12" /> Peruuta vähennys
                        </button>
                    </div>
                </div>

                <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div class="flex justify-between items-end mb-4">
                        <h2 class="font-bold text-slate-500 text-sm uppercase">Esitys (6.0)</h2>
                        <span class="text-3xl font-black text-blue-600">{{ presentation.toFixed(1) }}</span>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <button 
                            @click="adjustScore('pres', -0.1)" 
                            class="h-16 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-xl active:scale-95 transition-transform hover:bg-red-100">
                            -0.1
                        </button>
                        <button 
                            @click="adjustScore('pres', -0.3)" 
                            class="h-16 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-xl active:scale-95 transition-transform hover:bg-red-100">
                            -0.3
                        </button>
                    </div>
                    <div class="mt-2 flex justify-end">
                        <button 
                            @click="adjustScore('pres', 0.1)" 
                            class="text-xs text-slate-400 flex items-center gap-1 hover:text-blue-600 py-2 px-2">
                            <RotateCcw :size="12" /> Peruuta vähennys
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 pt-2">
                    <button 
                        @click="resetScore" 
                        class="h-14 rounded-xl font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 active:scale-95 transition-transform flex items-center justify-center gap-2">
                        <RotateCcw :size="18" /> Nollaa
                    </button>
                    <button 
                        @click="showSaveModal = true" 
                        class="h-14 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 active:scale-95 transition-transform flex items-center justify-center gap-2">
                        <Save :size="18" /> Tallenna
                    </button>
                </div>
            </div>

            <div v-else class="space-y-4 animate-fade-in">
                <div 
                    v-if="history.length === 0" 
                    class="text-center py-10 text-slate-400">
                    <History :size="48" class="mx-auto mb-2 opacity-20" />
                    <p>Ei vielä suorituksia.</p>
                </div>

                <div 
                    v-for="item in history" 
                    :key="item.id" 
                    class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <div class="font-bold text-slate-800 text-lg">{{ item.name }}</div>
                        <div class="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">{{ item.date }}</div>
                        <div class="text-xs text-slate-500 bg-slate-50 inline-block px-2 py-1 rounded">
                            Acc: <b>{{ item.accuracy }}</b> / Pres: <b>{{ item.presentation }}</b>
                        </div>
                    </div>
                    <div class="flex flex-col items-end gap-2">
                        <div class="text-2xl font-black text-blue-600">{{ item.total }}</div>
                        <button @click="deleteRecord(item.id)" class="text-slate-300 hover:text-red-500 p-1">
                            <Trash2 :size="18" />
                        </button>
                    </div>
                </div>
            </div>

        </main>

        <div v-if="showSaveModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div class="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-scale-in">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="font-bold text-xl text-slate-800">Tallenna tulos</h3>
                    <button 
                        @click="showSaveModal = false" 
                        class="text-slate-400 hover:text-slate-600">
                        <X />
                    </button>
                </div>

                <div class="mb-6">
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-2">
                        Kilpailijan nimi
                    </label>
                    <input 
                        v-model="athleteName"
                        type="text" 
                        placeholder="esim. Matti Meikäläinen" 
                        class="w-full text-lg p-4 bg-slate-50 rounded-xl border-2 border-slate-100 focus:border-blue-500 focus:outline-none transition-colors"
                        autoFocus
                    />
                </div>

                <div class="bg-blue-50 p-4 rounded-2xl mb-6 flex justify-between items-center">
                    <span class="text-blue-800 font-medium">Lopputulos</span>
                    <span class="text-3xl font-black text-blue-700">{{ totalScore }}</span>
                </div>

                <button 
                    @click="savePerformance"
                    :disabled="!athleteName"
                    class="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-200 disabled:opacity-50 disabled:shadow-none hover:bg-blue-700 active:scale-95 transition-all">
                    Vahvista
                </button>
            </div>
        </div>

    </div>
</template>

<style>
    /* Simppeli animaatio modaalille ja välilehdille */
    @keyframes scaleIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
    .animate-scale-in {
        animation: scaleIn 0.2s ease-out forwards;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
        animation: fadeIn 0.3s ease-out forwards;
    }
</style>
