import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ScoringTab from '../../components/ScoringTab.vue'

describe('ScoringTab', () => {
    it('initializes with correct default values', () => {
        const wrapper = mount(ScoringTab)

        // Check text content matches default accuracy (4.0)
        expect(wrapper.text()).toContain('4.0')
        expect(wrapper.vm.accuracy).toBe(4.0)
    })

    it('deducts points correctly', async () => {
        const wrapper = mount(ScoringTab)

        // Find deduction button (e.g. -0.3)
        // Note: Buttons have text -0.1 and -0.3
        const buttons = wrapper.findAll('button')
        const deduct03 = buttons.find(b => b.text().includes('-0.3'))

        await deduct03.trigger('click')

        expect(wrapper.vm.accuracy).toBe(3.7)
        expect(wrapper.text()).toContain('3.7')
    })

    it('prevents accuracy from going below zero', async () => {
        const wrapper = mount(ScoringTab)

        // Deduct 5.0 (lots of clicks) to try to go negative
        // Initial 4.0. Let's just create a custom method call or click many times.
        // Clicking 14 times on -0.3 (4.2 total) -> should stop at 0
        const buttons = wrapper.findAll('button')
        const deduct03 = buttons.find(b => b.text().includes('-0.3'))

        for (let i = 0; i < 15; i++) {
            await deduct03.trigger('click')
        }

        expect(wrapper.vm.accuracy).toBe(0.0)
    })

    it('supports smart undo', async () => {
        const wrapper = mount(ScoringTab)

        // Deduct 0.3
        const buttons = wrapper.findAll('button')
        const deduct03 = buttons.find(b => b.text().includes('-0.3'))
        await deduct03.trigger('click')
        expect(wrapper.vm.accuracy).toBe(3.7)

        // Find Undo button
        const undoBtn = buttons.find(b => b.text().includes('Peruuta'))
        await undoBtn.trigger('click')

        expect(wrapper.vm.accuracy).toBe(4.0)

        const deduct01 = buttons.find(b => b.text().includes('-0.1'))
        await deduct01.trigger('click')
        expect(wrapper.vm.accuracy).toBe(3.9)

        await undoBtn.trigger('click')

        expect(wrapper.vm.accuracy).toBe(4.0)
    })

    it('calculates total score including presentation', async () => {
        const wrapper = mount(ScoringTab)

        // Default presentation is 2.0 + 2.0 + 2.0 = 6.0
        // Default accuracy 4.0
        // Total should be 10.0
        expect(wrapper.text()).toContain('10.0')

        // Switch to step 2
        await wrapper.vm.goToPresentation()

        // Verify we are in step 2 (text "Presentation")
        expect(wrapper.text()).toContain('Presentation')

        // Adjust speedPower
        wrapper.vm.speedPower = 1.5
        // Wait for reactivity? Vue Test Utils usually handles this.
        await wrapper.vm.$nextTick()

        // New Presentation: 1.5 + 2.0 + 2.0 = 5.5
        // Accuracy: 4.0
        // Total: 9.5
        expect(wrapper.vm.presentationScore).toBe(5.5)

        expect(wrapper.vm.totalScore).toBe('9.5')
    })
})
