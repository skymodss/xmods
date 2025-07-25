import React, { FC, useEffect } from 'react'
import ButtonPrimary from '@/components/Button/ButtonPrimary'
import Error from '@/components/Error'
import Input from '@/components/Input/Input'
import Label from '@/components/Label/Label'
import Logo from '@/components/Logo/Logo'
import { IS_CHISNGHIAX_DEMO_SITE } from '@/contains/site-settings'
import { useLogin } from '@faustwp/core'
import Link from 'next/link'
import toast from 'react-hot-toast'
import getTrans from '@/utils/getTrans'
import { useLoginModal } from '@/hooks/useLoginModal'
import NcModal from '@/components/NcModal/NcModal'
import { useRouter } from 'next/router'
import GoogleLoginButton from '@/components/GoogleLoginButton2'

const LoginModal: FC = () => {
	const { login, loading, data, error } = useLogin()
	const { closeLoginModal, isOpen, urlRiderect } = useLoginModal()
	const router = useRouter()
	const T = getTrans()

	useEffect(() => {
		if (data?.generateAuthorizationCode?.error) {
			const errorMessage = data.generateAuthorizationCode.error.replace(
				/<[^>]+>/g,
				'',
			)
			toast.error(errorMessage, { position: 'bottom-center' })
			return
		}

		if (data?.generateAuthorizationCode?.code) {
			toast.success(
				'Login successful, system is reloading the page for synchronization...',
				{
					position: 'bottom-center',
					duration: 5000,
				},
			)
			if (urlRiderect) {
				router.push(urlRiderect)
			} else {
				router.reload()
			}
			// Zatvori modal nakon uspešnog logovanja
			closeLoginModal()
		}
	}, [data, router, urlRiderect, closeLoginModal])

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const username = e.currentTarget.username.value
		const password = e.currentTarget.password.value

		if (!username || !password) {
			toast.error('Username and password are required!', {
				position: 'bottom-center',
			})
			return
		}
		login(username, password, urlRiderect)
	}

	const errorMessage = error?.message || data?.generateAuthorizationCode?.error

	return (
		<NcModal
			isOpenProp={isOpen}
			onCloseModal={closeLoginModal}
			contentExtraClass="max-w-screen-md"
			modalTitle=""
			renderTrigger={() => null}
			renderContent={() => (
				<div className="flex min-h-full flex-1 flex-col justify-center py-2.5 sm:p-6 lg:pb-8">
					<div className="sm:mx-auto sm:w-full sm:max-w-sm">
						<Logo className="block w-full text-center" imageClassName="mx-auto" />
						<div className="text-center">
							<h2 className="mt-5 text-center text-xl font-semibold leading-9 tracking-tight text-neutral-900 sm:mt-7 md:text-2xl dark:text-neutral-200">
								{T['Sign in to your account']}
							</h2>
							{IS_CHISNGHIAX_DEMO_SITE && (
								<span className="text-xs text-neutral-500 dark:text-neutral-400">
									Try signing in with a demo account (demo/demo).
								</span>
							)}
						</div>
					</div>
					<div className="mt-5 sm:mx-auto sm:mt-10 sm:w-full sm:max-w-sm">
						<form className="grid gap-6" onSubmit={handleSubmit}>
							<div className="grid gap-4">
								<div className="grid gap-1.5">
									<Label htmlFor="username">{T.Username}</Label>
									<Input
										id="username"
										name="username"
										placeholder="Email or username"
										autoCapitalize="none"
										autoComplete="username"
										autoCorrect="off"
										type="text"
										required
										defaultValue={IS_CHISNGHIAX_DEMO_SITE ? 'demo' : undefined}
										autoFocus
									/>
								</div>
								<div className="grid gap-1.5">
									<Label htmlFor="password">{T.Password}</Label>
									<Input
										id="password"
										type="password"
										required
										defaultValue={IS_CHISNGHIAX_DEMO_SITE ? 'demo' : undefined}
									/>
								</div>
								<ButtonPrimary loading={loading} type="submit">{T.Login}</ButtonPrimary>
								{!!errorMessage && (
									<Error className="mt-2 text-center" error={errorMessage} />
								)}
								
							</div>
							<div className="flex items-center select-none">
      								<div className="flex-grow h-px bg-gray-300"></div>
      								<span className="mx-1 flex items-center justify-center px-1 py-0.5 text-gray-400 font-medium text-base">
        								or
      								</span>
      								<div className="flex-grow h-px bg-gray-300"></div>
    							</div>
							<div className="grid">
								<GoogleLoginButton />
							</div>
						</form>
						<p className="mt-5 text-center text-sm leading-6 text-neutral-500 sm:mt-10 dark:text-neutral-400">
							{T['Not a member?']}?{' '}
							<Link
								href="/sign-up"
								className="font-medium text-primary-600 underline-offset-2 hover:text-primary-500 hover:underline dark:text-primary-400"
								onClick={closeLoginModal}
							>
								{T['Sign up']}!
							</Link>
							<span className="mx-1">|</span>
							<Link
								href="/reset-password"
								className="font-medium text-primary-600 underline-offset-2 hover:text-primary-500 hover:underline dark:text-primary-400"
								onClick={closeLoginModal}
							>
								{T['Lost your password?']}
							</Link>
						</p>
					</div>
				</div>
			)}
		/>
	)
}

export default LoginModal
