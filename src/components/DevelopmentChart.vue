<script setup>
    import { ref, computed } from 'vue'
    
    const props = defineProps({
        history: {
            type: Array,
            default: () => []
        }
    })
    
    const selectedCompetitor = ref('')
    const selectedPoomsae = ref('')
    
    // Helpers
    const uniqueCompetitors = computed(() => {
        const names = props.history.map(h => h.name).filter(Boolean)
        return [...new Set(names)].sort()
    })
    
    const uniquePoomsaesForCompetitor = computed(() => {
        if (!selectedCompetitor.value) return []
        const poomsaes = props.history
        .filter(h => h.name === selectedCompetitor.value)
        .map(h => h.poomsae)
        .filter(Boolean)
        return [...new Set(poomsaes)].sort()
    })
    
    const chartData = computed(() => {
        if (!selectedCompetitor.value || !selectedPoomsae.value) return []
        
        // Configuration: Max data points to show
        const MAX_DATA_POINTS = 10
        
        return props.history
        .filter(h => h.name === selectedCompetitor.value && h.poomsae === selectedPoomsae.value)
        .sort((a, b) => a.id - b.id) // Oldest first
        .slice(-MAX_DATA_POINTS) // Take only the last N
        .map(h => ({
            date: h.date, // String format based on current App.vue logic
            accuracy: parseFloat(h.accuracy ?? 0),
            speed: parseFloat(h.details?.speed ?? 0),
            rhythm: parseFloat(h.details?.rhythm ?? 0),
            energy: parseFloat(h.details?.energy ?? 0),
        }))
    })
    
    // SVG Logic
    const width = 600
    const height = 300
    const padding = 40
    
    const points = computed(() => {
        const data = chartData.value
        if (data.length === 0) return []
        if (data.length === 1) {
            // Just one point, center it
            const x = width / 2
            const makeY = (val) => height - padding - (val / 2.0) * (height - 2 * padding)
            return {
                accuracy: [{x, y: makeY(data[0].accuracy)}],
                speed: [{x, y: makeY(data[0].speed)}],
                rhythm: [{x, y: makeY(data[0].rhythm)}],
                energy: [{x, y: makeY(data[0].energy)}],
            }
        }
        
        // Max value is 4.0 (Accuracy max is 4.0, others 2.0)
        const maxY = 4.0
        const minY = 0.0
        
        const getX = (index) => padding + (index / (data.length - 1)) * (width - 2 * padding)
        const getY = (val) => height - padding - (val / maxY) * (height - 2 * padding)
        
        const accuracyPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.accuracy) }))
        const speedPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.speed) }))
        const rhythmPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.rhythm) }))
        const energyPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.energy) }))
        
        return { accuracy: accuracyPoints, speed: speedPoints, rhythm: rhythmPoints, energy: energyPoints }
    })
    
    const makePath = (pts) => {
        if (!pts || pts.length < 2) return ''
        return 'M ' + pts.map(p => `${p.x},${p.y}`).join(' L ')
    }
    
    const formatDate = (dateStr) => {
        // Expecting "dd.mm. klo hh.mm" or similar from App.vue
        // Just returning simplifed part
        return dateStr.split(' ')[0] 
    }
    
</script>

<template>
    <div class="space-y-6">
        <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            
            <!-- Filters -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Kilpailija</label>
                    <input 
                        list="competitor-list" 
                        v-model="selectedCompetitor"
                        placeholder="Etsi kilpailija..."
                        class="w-full text-sm p-3 bg-slate-50 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none"
                        @change="selectedPoomsae = ''" 
                    />
                    <datalist id="competitor-list">
                        <option v-for="c in uniqueCompetitors" :key="c" :value="c" />
                    </datalist>
                </div>
                
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Liikesarja</label>
                    <input 
                        list="poomsae-list" 
                        v-model="selectedPoomsae"
                        placeholder="Valitse liikesarja..."
                        :disabled="!selectedCompetitor"
                        class="w-full text-sm p-3 bg-slate-50 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                    />
                    <datalist id="poomsae-list">
                        <option v-for="p in uniquePoomsaesForCompetitor" :key="p" :value="p" />
                    </datalist>
                </div>
            </div>
            
            <!-- Chart Area -->
            <div v-if="chartData.length > 0" class="relative">
                
                <div class="aspect-[2/1] w-full border border-slate-100 rounded-lg bg-slate-50 relative overflow-hidden">
                    <svg :viewBox="`0 0 ${width} ${height}`" class="w-full h-full">
                        <!-- Grid lines -->
                        <line v-for="i in 9" :key="`h-grid-${i}`" 
                        :x1="padding" 
                        :y1="height - padding - (i-1) * 0.5 / 4.0 * (height - 2*padding)" 
                        :x2="width - padding" 
                        :y2="height - padding - (i-1) * 0.5 / 4.0 * (height - 2*padding)"
                        stroke="#e2e8f0" 
                        stroke-width="1" 
                        />
                        
                        <!-- Y Axis Labels -->
                        <text v-for="i in 9" :key="`y-label-${i}`"
                        :x="padding - 10"
                        :y="height - padding - (i-1) * 0.5 / 4.0 * (height - 2*padding)" 
                        text-anchor="end" 
                        alignment-baseline="middle" 
                        class="text-[10px] fill-slate-400"
                        >{{ ((i-1) * 0.5).toFixed(1) }}</text>
                        
                        <!-- Data Paths -->
                        <path :d="makePath(points.accuracy)" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-sm opacity-90" />
                        <path :d="makePath(points.speed)" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-sm opacity-80" />
                        <path :d="makePath(points.rhythm)" fill="none" stroke="#16a34a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-sm opacity-80" />
                        <path :d="makePath(points.energy)" fill="none" stroke="#9333ea" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-sm opacity-80" />
                        
                        <!-- Data Points (Dots) -->
                        <g v-for="(pt, i) in points.accuracy" :key="`a-${i}`">
                            <circle :cx="pt.x" :cy="pt.y" r="4" fill="#ef4444" stroke="white" stroke-width="2" />
                        </g>
                        <g v-for="(pt, i) in points.speed" :key="`s-${i}`">
                            <circle :cx="pt.x" :cy="pt.y" r="4" fill="#2563eb" stroke="white" stroke-width="2" />
                        </g>
                        <g v-for="(pt, i) in points.rhythm" :key="`r-${i}`">
                            <circle :cx="pt.x" :cy="pt.y" r="4" fill="#16a34a" stroke="white" stroke-width="2" />
                        </g>
                        <g v-for="(pt, i) in points.energy" :key="`e-${i}`">
                            <circle :cx="pt.x" :cy="pt.y" r="4" fill="#9333ea" stroke="white" stroke-width="2" />
                        </g>
                        
                        <!-- X Axis Labels (Dates) -->
                        <text v-for="(d, i) in chartData" :key="`x-label-${i}`"
                        :x="points.speed && points.speed[i] ? points.speed[i].x : 0"
                        :y="height - padding + 20"
                        text-anchor="middle"
                        class="text-[10px] fill-slate-400 font-medium"
                        >{{ formatDate(d.date) }}</text>
                        
                    </svg>
                </div>
                
                <!-- Legend -->
                <div class="flex flex-wrap gap-4 justify-center mt-4">
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-red-500"></div>
                        <span class="text-xs font-bold text-slate-600">Accuracy</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-blue-600"></div>
                        <span class="text-xs font-bold text-slate-600">Speed & Power</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-green-600"></div>
                        <span class="text-xs font-bold text-slate-600">Rhythm & Tempo</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-purple-600"></div>
                        <span class="text-xs font-bold text-slate-600">Energy</span>
                    </div>
                </div>
                
            </div>
            
            <div v-else-if="selectedCompetitor && selectedPoomsae" class="text-center py-10 text-slate-400">
                <p>Ei dataa valitulla yhdistelmällä.</p>
            </div>
            
            <div v-else class="text-center py-10 text-slate-400">
                <p>Valitse kilpailija ja liikesarja nähdäksesi kehityksen.</p>
            </div>
            
        </div>
    </div>
</template>
