import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { portalApi } from '@/api/reservaApi'
import { getApiError } from '@/utils/helpers'
import type {
  ReservationRequest, ReservaCreadaResponse, SlotDisponibleResponse,
} from '@/types'

import StepIndicator from './nueva-reserva/StepIndicator'
import StepServicio  from './nueva-reserva/StepServicio'
import StepHorario   from './nueva-reserva/StepHorario'
import StepDatos     from './nueva-reserva/StepDatos'
import StepResumen   from './nueva-reserva/StepResumen'
import StepExito     from './nueva-reserva/StepExito'
import {
  ReservaFormState, parsePortalResponse, getServiceId, getSpecialistId,
} from './nueva-reserva/nuevaReserva.utils'

export default function NuevaReservaPage() {
  const [currentStep,         setCurrentStep]         = useState(0)
  const [formValues,          setFormValues]          = useState<ReservaFormState>({})
  const [createdReservation,  setCreatedReservation]  = useState<ReservaCreadaResponse | null>(null)
  const [errorMessage,        setErrorMessage]        = useState('')

  // Datos auxiliares para el resumen (no recargan al cambiar de paso)
  const { data: allServices = [] } = useQuery({
    queryKey: ['portal-services'],
    queryFn:  () => portalApi.loadServicios().then((r) => parsePortalResponse(r.data)),
  })
  const { data: specialists = [] } = useQuery({
    queryKey: ['portal-specialists', formValues.servicioId],
    queryFn:  () => portalApi.loadEspecialistas({ servicioId: Number(formValues.servicioId) })
      .then((r) => parsePortalResponse(r.data)),
    enabled: !!formValues.servicioId,
  })
  // Necesitamos los slots para extraer usuarioServicioId al confirmar
  const { data: availability } = useQuery({
    queryKey: ['availability', formValues.servicioId, formValues.fecha],
    queryFn:  () => portalApi.findDisponibilidad({
      servicioId: Number(formValues.servicioId!),
      fecha:      formValues.fecha!,
    }).then((r) => r.data),
    enabled: !!(formValues.servicioId && formValues.fecha),
  })

  const selectedService    = allServices.find((s) => String(getServiceId(s))    === String(formValues.servicioId))
  const selectedSpecialist = specialists.find((e) => String(getSpecialistId(e)) === String(formValues.especialistaId))

  const createReservation = useMutation({
    mutationFn: (data: ReservationRequest) => portalApi.saveOrUpdateReserva(data).then((r) => r.data),
    onSuccess:  (data) => { setCreatedReservation(data); setCurrentStep(4) },
    onError:    (err)  => setErrorMessage(getApiError(err)),
  })

  // Handlers de cada paso
  const handleStep0 = (values: Pick<ReservaFormState, 'categoriaId' | 'servicioId'>) => {
    setFormValues((p) => ({ ...p, ...values }))
    setCurrentStep(1)
  }
  const handleStep1 = (values: Pick<ReservaFormState, 'fecha' | 'especialistaId' | 'slot'>) => {
    setFormValues((p) => ({ ...p, ...values }))
    setCurrentStep(2)
  }
  const handleStep2 = (values: Pick<ReservaFormState, 'nombres' | 'apellidos' | 'celular' | 'email' | 'codigoValidacion'>) => {
    setFormValues((p) => ({ ...p, ...values }))
    setCurrentStep(3)
  }

  const handleConfirm = () => {
    setErrorMessage('')
    const allTimeSlots: SlotDisponibleResponse[] = availability?.slots ?? []
    const slot = allTimeSlots.find((s) => s.hora === formValues.slot)

    let usuarioServicioId: number | undefined
    if (formValues.especialistaId && formValues.especialistaId !== 'CUALQUIERA') {
      const sid = String(formValues.especialistaId)
      const esp = slot?.especialistas?.find(
        (e) => String(e.especialistaId) === sid || String(e.usuarioServicioId) === sid,
      )
      usuarioServicioId = esp?.usuarioServicioId
    } else {
      usuarioServicioId = slot?.especialistas?.[0]?.usuarioServicioId
    }

    if (!usuarioServicioId) {
      setErrorMessage('No se pudo determinar el especialista para este horario. Elige otro.')
      return
    }

    const hora     = formValues.slot!.length === 5 ? `${formValues.slot}:00` : formValues.slot!
    const fechaIso = `${formValues.fecha}T${hora}`

    createReservation.mutate({
      usuarioServicioId,
      fecha:            fechaIso,
      invitadoNombre:   formValues.nombres,
      invitadoApellido: formValues.apellidos,
      invitadoTelefono: formValues.celular,
      invitadoCorreo:   formValues.email,
    })
  }

  const handleReset = () => {
    setCurrentStep(0)
    setFormValues({})
    setCreatedReservation(null)
    setErrorMessage('')
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-10 px-4">
      {/* Top bar con branding y acceso a login */}
      <div className="max-w-3xl mx-auto flex items-center justify-between mb-6">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="font-display font-bold text-white text-sm">S</span>
          </div>
          <span className="font-display text-xl font-semibold text-neutral-900">Sanbella</span>
        </Link>
        <Link to="/login" className="btn-secondary gap-2">
          <LogIn size={15} /> Iniciar sesión
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="font-display text-2xl font-semibold text-neutral-900">Reserva tu cita</h1>
        <p className="text-sm text-neutral-500 mt-1">Completa los pasos para agendar tu servicio</p>
      </div>

      {currentStep < 4 && <StepIndicator current={currentStep} />}

      <div className="card max-w-lg mx-auto fade-enter">
        {currentStep === 0 && (
          <StepServicio values={formValues} onNext={handleStep0} />
        )}
        {currentStep === 1 && (
          <StepHorario values={formValues} onBack={() => setCurrentStep(0)} onNext={handleStep1} />
        )}
        {currentStep === 2 && (
          <StepDatos values={formValues} onBack={() => setCurrentStep(1)} onNext={handleStep2} />
        )}
        {currentStep === 3 && (
          <StepResumen
            values={formValues}
            selectedService={selectedService}
            selectedSpecialist={selectedSpecialist}
            errorMessage={errorMessage}
            isLoading={createReservation.isPending}
            onBack={() => setCurrentStep(2)}
            onConfirm={handleConfirm}
          />
        )}
        {currentStep === 4 && (
          <StepExito
            values={formValues}
            reservation={createdReservation}
            selectedService={selectedService}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  )
}
