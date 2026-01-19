<script setup>
import { History, Trash2 } from 'lucide-vue-next'
import { getPoomsaeColorClass } from '../data/poomsae.js'

defineProps({
    history: {
        type: Array,
        required: true
    }
})

defineEmits(['delete'])
</script>

<template>
    <div class="space-y-4 animate-fade-in">
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
                Acc: <b>{{ item.accuracy }}</b> / Pres: <b>{{ item.presentation }}</b><br/>S&P: {{ item.details?.speed ?? '-' }}, R&T: {{ item.details?.rhythm ?? '-' }}, EoE: {{ item.details?.energy ?? '-' }}
                <span class=" text-slate-300">|</span> <span class="text-slate-400">{{ item.date }}</span>
            </div>
        </div>
        <div class="flex flex-col items-end gap-2 pl-2">
            <div class="text-2xl font-black text-blue-600">{{ item.total }}</div>
            <button @click="$emit('delete', item.id)" class="text-slate-300 hover:text-red-500 p-2">
                <Trash2 :size="18" />
            </button>
        </div>
    </div>
</div>
</template>
