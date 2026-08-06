import {Link} from "react-router";



function LoginPage() {
  return (
    <main className = "grid min-h-screen lg:grid-cols-2" >
   <section className="hidden bg-(--color-primary) p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className = "font-(--font-heading) text-2xl font-bold" >
            FlowDeck
        </div>

       <div className="max-w-2xl">
            <h1 className="font-(--font-heading) text-5xl leading-[1.05] font-bold xl:text-6xl">
                Your team’s work, organized in one place.
            </h1>
            <p className = "mt-6 max-w-lg text-lg text-white/75 ">
                Plan projects, assign tasks, and keep your team aligned from one
            collaborative workspace.
            </p>
        </div>

        <p className="text-sm text-white/60">
          Organize. Collaborate. Deliver.
        </p>

     </section>

     <section className ="flex items-center justify-center bg-(--color-background) px-10 py-12">
        <div className =" w-full max-w-md">
           <div className="mb-10 font-(--font-heading) text-2xl font-bold text-(--color-primary) lg:hidden">
            FlowDeck
            </div>
            <h2 className="font-(--font-heading) text-4xl font-bold text-(--color-text-primary)" >
                Welcome back
                </h2> 
                <p className="mt-3 text-(--color-text-secondary)">
 Sign in to access your FlowDeck workspace.
                </p>

                <form className="mt-8 space-y-5">
                    <div>
                        <label
                        htmlFor ="email"
                        className ="mb-2 block text-sm font-semibold text-(--color-text-primary)"
                        >
                            Email address
                        </label>
                        <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@company.com"
                         className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 text-(--color-text-primary) outline-none transition focus:border-(--color-accent) focus:ring-3 focus:ring-(--color-accent)/15"
                        />
                    </div>

                     <div>
    <label
      htmlFor="password"
      className="mb-2 block text-sm font-semibold text-(--color-text-primary)"
    >
      Password
    </label>

    <input
      id="password"
      name="password"
      type="password"
      placeholder="Enter your password"
      className="w-full rounded-(--radius-md) border border-(--color-border) bg-white px-4 py-3 text-(--color-text-primary) outline-none transition focus:border-(--color-accent) focus:ring-3 focus:ring-(--color-accent)/15"
    />
  </div>

  <div className="flex items-center justify-between text-sm">
    <label className="flex items-center gap-2 text-(--color-text-secondary)">
      <input
        type="checkbox"
        className="h-4 w-4 accent-(--color-primary)"
      />
      Remember me
    </label>

   <Link 
   to="/forgot-password"
     className="font-semibold text-(--color-accent) hover:underline"
   >
    Forgot password?
   </Link>
  </div>

   <button
    type="submit"
    className="w-full rounded-(--radius-md) bg-(--color-primary) px-4 py-3 font-semibold text-white transition hover:opacity-90"
  >
    Sign in to FlowDeck
  </button>


                </form>

                <p className="mt-6 text-center text-sm text-(--color-text-secondary)">
  Don’t have an account?{" "}
 <Link
  to="/register"
  className="font-semibold text-(--color-accent) hover:underline"
>
  Create an account
</Link>
</p>
        </div>
     </section>



    </main>
  );
}

export default LoginPage;