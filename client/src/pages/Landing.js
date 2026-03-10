import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-amber-50">
      {/* logo row */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="h-9 w-9 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xl">
          🌿
        </div>
      </div>

      <div className="max-w-md w-full px-6 text-center">
        <span className="inline-flex items-center px-4 py-1 rounded-full bg-white shadow text-sm text-emerald-700 mb-6">
          🌾 Farm Fresh, Direct to You
        </span>

        <h1 className="text-3xl font-extrabold text-emerald-900 mb-4 leading-tight">
          Connect Directly with<br />Local Farmers
        </h1>

        <p className="text-sm text-emerald-900/70 mb-8">
          Skip the middlemen and access fresh, locally-grown produce at fair prices.
          Support your local farming community while enjoying the freshest food.
        </p>

        <div className="space-y-4">
          <Link
            to="/farmer-login"
            className="block w-full py-3 rounded-xl bg-emerald-700 text-white font-semibold shadow hover:bg-emerald-800"
          >
            Join as Farmer
          </Link>

          <Link
            to="/buyer-login"
            className="block w-full py-3 rounded-xl bg-amber-500 text-emerald-900 font-semibold shadow hover:bg-amber-600"
          >
            Join as Buyer
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Landing;
