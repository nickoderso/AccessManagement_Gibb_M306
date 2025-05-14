import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">AD Permissions Manager</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Erstellen Sie ein Konto, um Ihre Berechtigungen zu verwalten
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
