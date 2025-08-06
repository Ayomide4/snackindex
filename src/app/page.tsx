import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <main className="text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Snack Index
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Discover, rate, and organize your favorite snacks from around the world. 
              Your ultimate guide to the perfect snack experience.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-full transition-colors">
                Browse Snacks
              </button>
              <button className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-semibold py-3 px-8 rounded-full transition-colors">
                Add New Snack
              </button>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍿</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Discover</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Explore thousands of snacks from different cultures and regions
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Rate</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Share your opinions and read reviews from other snack enthusiasts
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Organize</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create your personal snack collection and wishlist
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Snack Index Stats</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-500 mb-2">1,000+</div>
                <div className="text-gray-600 dark:text-gray-300">Snacks Indexed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-500 mb-2">50+</div>
                <div className="text-gray-600 dark:text-gray-300">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-500 mb-2">10K+</div>
                <div className="text-gray-600 dark:text-gray-300">Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-500 mb-2">5K+</div>
                <div className="text-gray-600 dark:text-gray-300">Users</div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 Snack Index. Made with ❤️ for snack lovers everywhere.</p>
        </footer>
      </div>
    </div>
  );
}
