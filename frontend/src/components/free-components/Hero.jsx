export default function Hero() {
  return (
    <div class="bg-white">
      <div class="relative isolate overflow-hidden">
        <div class="px-6 lg:px-8">
          <div class="mx-auto max-w-2xl py-10 sm:py-48 lg:py-28">
            <div class="hidden sm:mb-8 sm:flex sm:justify-center">
              <div class="relative flex items-center justify-center gap-3 rounded-lg bg-white p-1 pr-2.5 text-sm font-medium leading-6 text-gray-600 shadow-sm ring-1 ring-gray-900/10 hover:bg-gray-50">
                <span class="inline-block rounded-md bg-white px-2 ring-1 ring-inset ring-gray-900/10">
                  New release
                </span>
                <a
                  href="#"
                  class="inline-flex items-center justify-center gap-1"
                >
                  <span class="absolute inset-0" aria-hidden="true"></span>
                  Explore our latest features
                  <svg
                    class="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 12H19M19 12L13 6M19 12L13 18"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                  </svg>
                </a>
              </div>
            </div>
            <div class="sm:text-center">
              <h1 class="text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
                Achieve more with less effort
              </h1>
              <p class="mt-6 text-lg leading-8 text-gray-600">
                Simplify your workflows and automate daily tasks with ease,
                saving time to focus on what matters most for your business.
              </p>
            </div>
            <div class="mt-10 flex items-center justify-start gap-6 sm:justify-center">
              <a
                href="#"
                class="inline-flex items-center justify-center gap-2 rounded-md bg-pink-500 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-pink-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
              >
                <svg
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <path
                    d="M10.9 8.8L10.6577 8.66152C10.1418 8.36676 9.5 8.73922 9.5 9.33333L9.5 14.6667C9.5 15.2608 10.1418 15.6332 10.6577 15.3385L10.9 15.2L15.1 12.8C15.719 12.4463 15.719 11.5537 15.1 11.2L10.9 8.8Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                Demo
              </a>
              <a href="#" class="text-sm font-semibold leading-6 text-gray-900">
                Learn more
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
