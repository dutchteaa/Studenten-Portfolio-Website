export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navigatie */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">Studenten Portfolio</h1>
          <div className="flex gap-4">
            <a href="/portfolio" className="text-gray-600 hover:text-blue-600 font-medium">Portfolio</a>
            <a href="/aanvraag" className="text-gray-600 hover:text-blue-600 font-medium">Project aanvragen</a>
            <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">Inloggen</a>
          </div>
        </div>
      </nav>

      {/* Hero sectie */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="bg-blue-100 text-blue-600 text-sm font-medium px-3 py-1 rounded-full">
            School Portfolio Platform
          </span>
          <h2 className="text-5xl font-bold text-gray-900 mt-6 mb-6">
            Studenten ontmoeten<br />het bedrijfsleven
          </h2>
          <p className="text-xl text-gray-500 mb-10">
            Bekijk projecten van onze studenten of vraag een project aan
            en laat onze studenten aan de slag gaan met jouw uitdaging.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/portfolio"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
              Bekijk portfolio
            </a>
            <a href="/aanvraag"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50">
              Project aanvragen
            </a>
          </div>
        </div>
      </section>

      {/* Drie kolommen */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎓</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Voor studenten</h3>
            <p className="text-gray-500 text-sm">
              Maak een account aan en publiceer je projecten op de publieke portfolio.
            </p>
            <a href="/register" className="inline-block mt-4 text-blue-600 hover:underline text-sm font-medium">
              Account aanmaken →
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏢</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Voor bedrijven</h3>
            <p className="text-gray-500 text-sm">
              Geen account nodig. Vul het formulier in en onze studenten gaan aan de slag.
            </p>
            <a href="/aanvraag" className="inline-block mt-4 text-green-600 hover:underline text-sm font-medium">
              Project aanvragen →
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💼</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Projecten bekijken</h3>
            <p className="text-gray-500 text-sm">
              Bekijk alle gepubliceerde projecten van onze studenten op de portfolio pagina.
            </p>
            <a href="/portfolio" className="inline-block mt-4 text-purple-600 hover:underline text-sm font-medium">
              Naar portfolio →
            </a>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto bg-blue-600 rounded-2xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Bent u een bedrijf?</h3>
          <p className="text-blue-100 mb-8 text-lg">
            Vraag gratis een project aan en laat onze studenten een oplossing bouwen voor uw uitdaging.
          </p>
          <a href="/aanvraag"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 inline-block">
            Project aanvragen
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8 px-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center text-sm text-gray-500">
          <p>© 2025 Studenten Portfolio</p>
          <div className="flex gap-6">
            <a href="/portfolio" className="hover:text-gray-900">Portfolio</a>
            <a href="/aanvraag" className="hover:text-gray-900">Project aanvragen</a>
            <a href="/login" className="hover:text-gray-900">Inloggen</a>
          </div>
        </div>
      </footer>

    </div>
  );
}