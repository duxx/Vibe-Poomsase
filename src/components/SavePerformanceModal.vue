<script setup>
import { ref, watch } from 'vue'
import { User, Activity, X } from 'lucide-vue-next'
import { POOMSAE_DATA } from '../data/poomsae.js'

const props = defineProps({
    isOpen: Boolean,
    scoreData: {
        type: Object, // { total: string, ... }
        default: () => ({ total: '0.0' })
    }
})

const emit = defineEmits(['close', 'save'])

const athleteName = ref('')
const selectedPoomsae = ref('')

// Focus input when modal opens (simple approach) or reset fields
watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        // Reset local fields
        athleteName.value = ''
        selectedPoomsae.value = ''
    }
})

const handleSave = () => {
    if (!athleteName.value.trim()) return

    const poomsaeData = POOMSAE_DATA.find(p => p.name === selectedPoomsae.value)
    const poomsaeType = poomsaeData ? poomsaeData.type : 'unknown'

    const record = {
        name: athleteName.value,
        poomsae: selectedPoomsae.value || 'Ei määritelty',
        poomsaeType: poomsaeType,
        ...props.scoreData
    }

    emit('save', record)
    
    // Reset local fields
    athleteName.value = ''
    selectedPoomsae.value = ''
}
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
        <div class="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-scale-in">
            <div class="flex justify-between items-center mb-6">
                <h3 class="font-bold text-xl text-slate-800">Tallenna tulos</h3>
                <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 bg-slate-100 p-1 rounded-full"><X :size="20" /></button>
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
                <span class="text-4xl font-black text-blue-700">{{ scoreData.total }}</span>
            </div>
            
            <button 
                @click="handleSave"
                :disabled="!athleteName"
                class="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-200 disabled:opacity-50 disabled:shadow-none hover:bg-blue-700 active:scale-95 transition-all"
                >
                Tallenna historiaan
            </button>
        </div>
    </div>
</template>

<style scoped>
    @keyframes scaleIn {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    .animate-scale-in {
        animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
</style>
