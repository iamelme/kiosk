type Params = {
  email: string
}
export default async function useReset({ email }: Params) {
  console.log(email)

// await window.apiElectron.resetPassword(email)

}
