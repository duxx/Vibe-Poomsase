<script setup>
import { ref, onMounted } from 'vue'

// Components
import ScoringTab from './components/ScoringTab.vue'
import HistoryTab from './components/HistoryTab.vue'
import DevelopmentChart from './components/DevelopmentChart.vue'
import SavePerformanceModal from './components/SavePerformanceModal.vue'

// State
const activeTab = ref('scoring')
const history = ref([])
const showSaveModal = ref(false)
const tempScoreData = ref(null) // Data passed from ScoringTab to Modal
const scoringTabRef = ref(null) // To call reset

onMounted(() => {
    const saved = localStorage.getItem('poomsae_history')
    if (saved) history.value = JSON.parse(saved)
})

// --- EVENT HANDLERS ---

// 1. ScoringTab requests save -> Open Modal
const onSaveRequest = (data) => {
    tempScoreData.value = data
    showSaveModal.value = true
}

// 2. Modal confirms save -> Add to history, reset scoring, close modal
const onSaveConfirm = (record) => {
    const newRecord = {
        id: Date.now(),
        date: new Date().toLocaleString('fi-FI', { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' }),
        ...record
        // record contains: name, poomsae, accuracy, presentation, details, total
    }
    
    history.value.unshift(newRecord)
    localStorage.setItem('poomsae_history', JSON.stringify(history.value))
    
    showSaveModal.value = false
    
    // Reset the scoring tab logic
    if (scoringTabRef.value) {
        scoringTabRef.value.fullReset()
    }
}

const onDeleteRecord = (id) => {
    if (confirm('Poistetaanko suoritus historiasta?')) {
        history.value = history.value.filter(item => item.id !== id)
        localStorage.setItem('poomsae_history', JSON.stringify(history.value))
    }
}

</script>

<template>
    <div class="max-w-md mx-auto min-h-screen bg-slate-50 text-slate-900 shadow-2xl overflow-hidden relative font-sans">
        
        <main class="p-4 space-y-4">
            
            <!-- Navigation -->
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
                <button 
                    @click="activeTab = 'development'"
                    :class="['flex-1 py-2.5 rounded-lg transition-all', activeTab === 'development' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700']"
                    >
                    Kehittyminen
                </button>
            </div>
    
            <!-- Content -->
            
            <!-- Use KeepAlive for ScoringTab so the state persists when switching tabs -->
            <KeepAlive>
                <ScoringTab 
                    v-if="activeTab === 'scoring'" 
                    ref="scoringTabRef"
                    @save="onSaveRequest"
                />
            </KeepAlive>

            <HistoryTab 
                v-if="activeTab === 'history'" 
                :history="history" 
                @delete="onDeleteRecord"
            />
            
            <DevelopmentChart 
                v-if="activeTab === 'development'" 
                :history="history" 
            />

        </main>

        <footer class="flex-none p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2 opacity-60 grayscale hover:grayscale-0 transition-all">
            <img src="/logo.png" alt="Logo" class="h-5 w-5 object-contain" onError="this.style.display='none'" />
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Länkyn Taekwondo</span>
        </footer>

        <SavePerformanceModal 
            :is-open="showSaveModal"
            :score-data="tempScoreData || {}"
            @close="showSaveModal = false"
            @save="onSaveConfirm"
        />

    </div>
</template>

<style>
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
        animation: fadeIn 0.3s ease-out forwards;
    }
</style>
