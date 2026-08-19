import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Heart, Mail, Sparkles, UserCheck } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Kids Styling Appointments",
  description: "Book a personal styling consultation for South Indian kids' lehenga choli, pattu pavadai fit guidance, and ceremony wardrobe planning.",
  path: "/appointments"
});

export default function AppointmentsPage() {
  return (
    <div className="bg-[#FDFAF5] py-10 sm:py-16 min-h-[calc(100vh-200px)]">
      <section className="container-page space-y-12">
        {/* Page Header & Lotus Ornament */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-900/15 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-900 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-800" /> AMZIRA Atelier Concierge
          </div>
          <h1 className="font-display text-4xl font-semibold text-maroon-deep sm:text-5xl lg:text-6xl tracking-tight">
            Styling Appointments
          </h1>

          {/* Lotus Line Art Ornament Divider */}
          <div className="flex items-center gap-3 my-3 w-48">
            <div className="h-px bg-gradient-to-r from-amber-700/40 via-amber-700/20 to-transparent flex-1" />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-5 h-5 text-amber-800/60 shrink-0"
              aria-hidden="true"
            >
              <path
                d="M12 3C12 3 8.5 7.5 8.5 12C8.5 14.5 10 16.5 12 17C14 16.5 15.5 14.5 15.5 12C15.5 7.5 12 3 12 3Z"
                stroke="currentColor"
              />
              <path
                d="M12 17C9.5 17 4 14 4 11C4 9.5 5.5 8.5 7 9C9 9.5 10.5 11.5 12 17Z"
                stroke="currentColor"
              />
              <path
                d="M12 17C14.5 17 20 14 20 11C20 9.5 18.5 8.5 17 9C15 9.5 13.5 11.5 12 17Z"
                stroke="currentColor"
              />
            </svg>
            <div className="h-px bg-gradient-to-l from-amber-700/40 via-amber-700/20 to-transparent flex-1" />
          </div>

          <p className="text-sm sm:text-base leading-6 text-charcoal/70">
            Personalized size guidance, custom stitching timelines, and event-wise ceremony wardrobe styling for your little princess.
          </p>
        </div>

        {/* Dual Column Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          {/* Left Column: Service Experience Cards */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-amber-900/10 bg-[#FAF7F2] p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="font-display text-2xl font-semibold text-maroon-deep">
                Why book an Atelier appointment?
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4 rounded-2xl border border-amber-900/10 bg-white p-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-maroon-soft text-maroon font-bold">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-maroon-deep">Fit & Size Guidance</h3>
                    <p className="mt-1 text-xs leading-relaxed text-charcoal/68">
                      Expert size recommendations specifically calibrated for growing children, ensuring comfort for long wedding & puja rituals.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-amber-900/10 bg-white p-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-maroon-soft text-maroon font-bold">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-maroon-deep">Event-Wise Color Matching</h3>
                    <p className="mt-1 text-xs leading-relaxed text-charcoal/68">
                      Custom color palette matching for temple ceremonies, family weddings, birthdays, and festive family photoshoots.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-amber-900/10 bg-white p-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-maroon-soft text-maroon font-bold">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-maroon-deep">Stitching & Delivery Timelines</h3>
                    <p className="mt-1 text-xs leading-relaxed text-charcoal/68">
                      Direct coordination with our South Indian master weavers to guarantee delivery ahead of your milestone date.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Email Card */}
            <div className="rounded-3xl border border-amber-900/10 bg-gradient-to-br from-[#580B26] to-[#700018] p-6 text-white shadow-md">
              <h3 className="font-display text-xl font-semibold">Prefer direct email?</h3>
              <p className="mt-2 text-xs text-white/80 leading-relaxed">
                Send your ceremony dates, delivery city, and outfit preferences to our boutique styling team.
              </p>
              <a
                href="mailto:care@amzira.com?subject=AMZIRA%20Kids%20Styling%20Appointment"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-maroon-deep shadow-xs transition hover:bg-amber-50"
              >
                <Mail className="h-4 w-4" /> Email care@amzira.com
              </a>
            </div>
          </div>

          {/* Right Column: Appointment Booking Request Card */}
          <div className="rounded-3xl border border-amber-900/10 bg-[#FAF7F2] p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="font-display text-2xl font-semibold text-maroon-deep">
                Request a Consultation
              </h2>
              <p className="mt-1 text-xs text-charcoal/65">
                Fill in your details below and an AMZIRA stylist will get in touch within 24 hours.
              </p>
            </div>

            <form
              className="space-y-4"
              action="mailto:care@amzira.com?subject=AMZIRA%20Styling%20Request"
              method="post"
              encType="text/plain"
            >
              <label className="form-field">
                Parent&apos;s Full Name
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  required
                  className="rounded-xl border-amber-900/15"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="form-field">
                  Mobile Number (WhatsApp)
                  <input
                    type="tel"
                    name="phone"
                    placeholder="10-digit mobile"
                    required
                    className="rounded-xl border-amber-900/15"
                  />
                </label>

                <label className="form-field">
                  Child&apos;s Age / Size
                  <select name="childAge" className="rounded-xl border-amber-900/15 bg-white">
                    <option value="1-2Y">1 - 2 Years</option>
                    <option value="2-3Y">2 - 3 Years</option>
                    <option value="3-4Y">3 - 4 Years</option>
                    <option value="4-5Y">4 - 5 Years</option>
                    <option value="5-6Y">5 - 6 Years</option>
                    <option value="6-7Y">6 - 7 Years</option>
                    <option value="7-8Y">7 - 8 Years</option>
                    <option value="9-10Y">9 - 10 Years</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="form-field">
                  Occasion Type
                  <select name="occasion" className="rounded-xl border-amber-900/15 bg-white">
                    <option value="wedding">Family Wedding</option>
                    <option value="temple_puja">Temple Puja / Ear Piercing</option>
                    <option value="birthday">Birthday Celebration</option>
                    <option value="festival">Festive (Diwali/Pongal/Onam)</option>
                    <option value="other">Other Celebration</option>
                  </select>
                </label>

                <label className="form-field">
                  Ceremony Date
                  <input
                    type="date"
                    name="ceremonyDate"
                    className="rounded-xl border-amber-900/15"
                  />
                </label>
              </div>

              <label className="form-field">
                Styling Preferences & Delivery City
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Mention color preferences, budget, or specific outfit requirements..."
                  className="rounded-xl border-amber-900/15"
                />
              </label>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#580B26] py-4 text-xs font-extrabold uppercase tracking-widest text-white shadow-md transition hover:bg-[#43071c]"
              >
                <CalendarDays className="h-4 w-4" /> Request Appointment <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-center text-[11px] text-charcoal/50">
                🔒 Free service. No obligation to purchase.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
