// Imports et Mock en Premier sinon erreurs
import { vi } from 'vitest'

// Créez un spy partagé pour setUser
const setUserSpy = vi.fn()

vi.mock('firebase/auth', async () => {
    const actual = await vi.importActual('firebase/auth')
    return {
        ...actual,
        signInWithEmailAndPassword: vi.fn()
    }
})

vi.mock('firebase/firestore', async () => {
    const actual = await vi.importActual('firebase/firestore')
    return {
        ...actual,
        getDoc: vi.fn()
    }
})

vi.mock('@/router', () => ({
    default: { push: vi.fn() }
}))

vi.mock('@/stores/auth', () => ({
    useAuthStore: () => ({
        setUser: setUserSpy
    })
}))

// Reste des imports
import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import Login from '@/views/Login.vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { getDoc } from 'firebase/firestore'
import router from '@/router'

const signInMock = signInWithEmailAndPassword as unknown as ReturnType<typeof vi.fn>
const getDocMock = getDoc as unknown as ReturnType<typeof vi.fn>

describe('Login.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // Simulation login Etudiant
    it('devrait rediriger vers "/dashboard" pour un utilisateur avec statut 0', async () => {
        const fakeUser = { uid: 'uid123', email: 'test@example.com' }
        signInMock.mockResolvedValue({ user: fakeUser })

        // Simulation d'un doc Firestore existant avec statut 0
        const docSnapshot = {
            exists: () => true,
            data: () => ({ statut: 0 })
        }
        getDocMock.mockResolvedValue(docSnapshot)

        // Simul formulaire
        const wrapper = mount(Login)
        await wrapper.find('input[type="email"]').setValue('test@example.com')
        await wrapper.find('input[type="password"]').setValue('correctpassword')
        await wrapper.find('form').trigger('submit.prevent')
        await flushPromises()

        // Vérifiez que setUser est ok
        expect(setUserSpy).toHaveBeenCalledWith({
            uid: fakeUser.uid,
            email: fakeUser.email,
            statut: 0
        })

        // Vérifiez que router.push a été appelé avec '/dashboard'
        const routerPushMock = router.push as unknown as ReturnType<typeof vi.fn>
        expect(routerPushMock).toHaveBeenCalledWith('/dashboard')
    })

    // Simulation login Intervenant
    it('devrait rediriger vers "/dashboard-intervenant" pour un utilisateur avec statut 5', async () => {
        const fakeUser = { uid: 'uid456', email: 'intervenant@example.com' }
        signInMock.mockResolvedValue({ user: fakeUser })
        const docSnapshot = {
            exists: () => true,
            data: () => ({ statut: 5 })
        }
        getDocMock.mockResolvedValue(docSnapshot)

        const wrapper = mount(Login)
        await wrapper.find('input[type="email"]').setValue('intervenant@example.com')
        await wrapper.find('input[type="password"]').setValue('motdepasseIntervenant')
        await wrapper.find('form').trigger('submit.prevent')
        await flushPromises()

        expect(setUserSpy).toHaveBeenCalledWith({
            uid: fakeUser.uid,
            email: fakeUser.email,
            statut: 5
        })
        const routerPushMock = router.push as unknown as ReturnType<typeof vi.fn>
        expect(routerPushMock).toHaveBeenCalledWith('/dashboard-intervenant')
    })

    // Simulation login Administratif
    it('devrait rediriger vers "/dashboard-administratif" pour un utilisateur avec statut 10', async () => {
        const fakeUser = { uid: 'uid789', email: 'admin@example.com' }
        signInMock.mockResolvedValue({ user: fakeUser })
        const docSnapshot = {
            exists: () => true,
            data: () => ({ statut: 10 })
        }
        getDocMock.mockResolvedValue(docSnapshot)

        const wrapper = mount(Login)
        await wrapper.find('input[type="email"]').setValue('admin@example.com')
        await wrapper.find('input[type="password"]').setValue('motdepasseAdmin')
        await wrapper.find('form').trigger('submit.prevent')
        await flushPromises()

        expect(setUserSpy).toHaveBeenCalledWith({
            uid: fakeUser.uid,
            email: fakeUser.email,
            statut: 10
        })
        const routerPushMock = router.push as unknown as ReturnType<typeof vi.fn>
        expect(routerPushMock).toHaveBeenCalledWith('/dashboard-administratif')
    })

    // Simulation Mauvais email ou mdp
    it("devrait afficher un message d'erreur lorsque l'authentification échoue", async () => {
        // Simuler une erreur d'authentification (ex. : identifiants invalides)
        signInMock.mockRejectedValue(new Error('Invalid credentials'))

        const wrapper = mount(Login)
        await wrapper.find('input[type="email"]').setValue('test@example.com')
        await wrapper.find('input[type="password"]').setValue('wrongpassword')
        await wrapper.find('form').trigger('submit.prevent')
        await flushPromises()

        // Vérifier que le message d'erreur est affiché dans le composant
        expect(wrapper.text()).toContain('Email ou mot de passe incorrect.')
    })

})
