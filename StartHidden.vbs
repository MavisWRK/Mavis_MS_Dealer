Option Explicit

Dim shell, files, projectDirectory, logDirectory, command, exitCode

Set shell = CreateObject("WScript.Shell")
Set files = CreateObject("Scripting.FileSystemObject")
projectDirectory = files.GetParentFolderName(WScript.ScriptFullName)
logDirectory = files.BuildPath(projectDirectory, "logs")

If Not files.FolderExists(logDirectory) Then files.CreateFolder logDirectory

shell.CurrentDirectory = projectDirectory
shell.Environment("PROCESS")("MAVIS_HIDDEN_START") = "1"

command = "cmd.exe /d /c Start.bat"
If WScript.Arguments.Count > 0 Then
  If LCase(WScript.Arguments(0)) = "--check" Then
    command = command & " --check"
  End If
End If
command = command & " >> logs\startup.log 2>&1"

exitCode = shell.Run(command, 0, True)
WScript.Quit exitCode
