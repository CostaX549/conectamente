import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { checkUser } from '@/lib/checkUser'
import { Calendar, CreditCard, ShieldCheck, Stethoscope, User, MessageCircle } from 'lucide-react'
import { checkAndAllocateCredits } from '@/actions/credits'
import { Badge } from './ui/badge'

const Header = async () => {
  const user = await checkUser()
  if(user?.role === "PATIENT") {
  await checkAndAllocateCredits(user)
  }
  return (
    <header className="fixed top-0  w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/">
            <Image
            src="/logo-single.png"
            alt="Medimeet logo"
            width={200}
            height={60}
            className="h-15 w-auto object-contain"
             />
            </Link>
            <div className="flex items-center space-x-2">

              <SignedIn>
                 {user?.role === "ADMIN" && (
              <Link href="/admin">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Painel do Administrador
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  <ShieldCheck className="h-4 w-4" />
                </Button>
              </Link>
            )}
                     {user?.role === "DOCTOR" && (
                           <div className="flex gap-2">
              <Link href="/doctor">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2"
                >
                  <Stethoscope className="h-4 w-4" />
                  Painel do Médico
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  <Stethoscope className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/chat">
  <Button variant="outline" className="hidden md:inline-flex items-center gap-2">
    <MessageCircle className="h-4 w-4" />
    Chat
  </Button>
  <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
    <MessageCircle className="h-4 w-4" />
  </Button>
</Link>
</div>
            )}
                {user?.role === "PATIENT" && (
                  <div className="flex gap-2">
              <Link href="/appointments">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Meus Agendamentos
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  <Calendar className="h-4 w-4" />
                </Button>
              </Link>
              {/* Botão de Chat */}
<Link href="/chat">
  <Button variant="outline" className="hidden md:inline-flex items-center gap-2">
    <MessageCircle className="h-4 w-4" />
    Chat
  </Button>
  <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
    <MessageCircle className="h-4 w-4" />
  </Button>
</Link>
</div>
            )}
                {user?.role === "UNASSIGNED" && (
                  <Link href="/onboarding">
                    <Button variant="outline" className="hidden md:inline-flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Completar Perfil
                    </Button>
                     <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                      <User className="h-4 w-4" />
                    
                    </Button>
                  </Link>
                )}
              </SignedIn>
              {(!user || user?.role === "PATIENT") && (
  <Link href="/pricing">
    <Badge
      variant="outline"
      className="h-9 bg-emerald-900/20 border-emerald-700/30 px-3 py-1 flex items-center gap-2"
    >
      <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
      <span className="text-emerald-400">
        {user && user?.role === "PATIENT" ? (
          <>
            {user.credits}{" "}
            <span className="hidden md:inline">Créditos</span>
          </>
        ) : (
          <>Preços</>
        )}
      </span>
    </Badge>
  </Link>
)}

              <SignedOut>
              <SignInButton>
                <Button variant="secondary">Login</Button>
                </SignInButton>
          
               
            </SignedOut>
            <SignedIn>
              <UserButton 
                  appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                  userButtonPopoverCard: "shadow-xl",
                  userPreviewMainIdentifier: "font-semibold",
                },
              }}
              />
            </SignedIn>
            </div>
        </nav>
    </header>
  )
}

export default Header