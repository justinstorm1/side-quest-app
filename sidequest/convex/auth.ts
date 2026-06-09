import { convexAuth } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";
import Apple from "@auth/core/providers/apple";
import Google from "@auth/core/providers/google";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    GitHub({
      profile: (githubInfo) => {
        return {
          id: githubInfo.id.toString(),
          name: githubInfo.name,
          email: githubInfo.email,
        }
      }
    }), 
    Apple({
      profile: (appleInfo) => {
        const name = appleInfo.user
          ? `${appleInfo.user.name.firstName} ${appleInfo.user.name.lastName}`
          : undefined;
        return {
          id: appleInfo.sub,
          name: name,
          email: appleInfo.email,
        };
      },
    }), 
    Google({
      profile: (googleInfo) => ({
        id: googleInfo.sub,
        name: googleInfo.name,
        email: googleInfo.email,
      })
    })
  ],
});
