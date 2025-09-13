import Colors, { ThemeColors } from "@/constants/Colors"
import { createContext, useContext, useState } from "react"
import { firestoreDB } from "@/context/authContext";
import { doc, setDoc } from "firebase/firestore";

type themeType = {
    theme: 'light' | 'dark'
    changeTheme :(newTheme?:'light' | 'dark') => void
    colors: ThemeColors
}


const themeContext = createContext<themeType | undefined>(undefined)


export function useThemeContext() : themeType{
    const context = useContext(themeContext)

    if(!context){
        throw new Error("Calling theme context outside provider")
    }else{
        return context
    }
}



type ThemeProviderProps ={
    children: React.ReactNode

}


export const ThemeProvider = ({children}:ThemeProviderProps ) =>{
    const [theme, setTheme] = useState<'light' | 'dark'>('light')




    const themeInfo: themeType ={
        theme,

        changeTheme(newTheme){
            console.log("Theme changed from:"+theme)

            
            setTheme((prev)=> newTheme? newTheme : (prev === 'light' ? 'dark' : 'light'))

        },

        colors: Colors[theme]

    }


    return <themeContext.Provider value={(themeInfo)}>{children}</themeContext.Provider>

}