<script setup>
import { ref, computed } from 'vue'
import { RotateCcw, Save, ArrowRight, ArrowLeft } from 'lucide-vue-next'

const emit = defineEmits(['save'])

// --- STATE ---
const scoringStep = ref(1) // 1 = Live (Accuracy), 2 = Post (Presentation)

const accuracy = ref(4.0)
const actionStack = ref([]) // "Smart Undo" history

const speedPower = ref(2.0)
const rhythmTempo = ref(2.0)
const expressionEnergy = ref(2.0)

// --- COMPUTED ---
const presentationScore = computed(() => {
    return (parseFloat(speedPower.value) + parseFloat(rhythmTempo.value) + parseFloat(expressionEnergy.value))
})

const totalScore = computed(() => (accuracy.value + presentationScore.value).toFixed(1))

// --- LOGIC ---
const deductScore = (amount) => {
    // Accuracy logic
    let newVal = accuracy.value + amount
    let actualDeduction = amount
    
    if (newVal < 0) {
        newVal = 0
        actualDeduction = -accuracy.value 
    }
    
    actionStack.value.push(actualDeduction) // Store only amount
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
        fullReset()
    }
}

const fullReset = () => {
    scoringStep.value = 1
    accuracy.value = 4.0
    actionStack.value = []
    // Reset presentation defaults
    speedPower.value = 2.0
    rhythmTempo.value = 2.0
    expressionEnergy.value = 2.0
}

// Emits the current score data to the parent for saving
const requestSave = () => {
    emit('save', {
        accuracy: accuracy.value.toFixed(1),
        presentation: presentationScore.value.toFixed(1),
        details: {
            speed: parseFloat(speedPower.value).toFixed(1),
            rhythm: parseFloat(rhythmTempo.value).toFixed(1),
            energy: parseFloat(expressionEnergy.value).toFixed(1)
        },
        total: totalScore.value
    })
}

// Expose reset method to parent if needed (e.g. after successful save)
defineExpose({
    fullReset
})

const goToPresentation = () => scoringStep.value = 2
const backToLive = () => scoringStep.value = 1

</script>

<template>
    <div class="space-y-4 animate-fade-in">
        
        <!-- Total Score Header (Moved inside component as requested) -->
        <div class="bg-slate-900 rounded-3xl p-3 text-center text-white shadow-xl shadow-slate-200">
            <p class="text-slate-400 text-xs font-bold uppercase tracking-widest">Kokonaispisteet</p>
            <div class="text-6xl font-black tabular-nums tracking-tighter leading-none">
                {{ totalScore }}
            </div>
        </div>

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
                <button @click="requestSave" class="bg-green-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg">
                    <Save :size="16" /> Tallenna
                </button>
            </div>

        </div>
    </div>
</template>
