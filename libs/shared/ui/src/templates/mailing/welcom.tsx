import EmailLayout from "./layout"

const WelcomeEmail = () => {
  return (
    <EmailLayout>
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-indigo-600">Welcome to Our App</h1>
      </div>
    </EmailLayout>
  )
}

export default WelcomeEmail
